import { inject, injectable } from 'inversify';
import { DataSource, EntityTarget } from 'typeorm';
import { Constants } from '../../../constants';
import { TYPES } from '../../../type';
import { IWinstonLogger } from '../../logger/interface';
import * as Entity from './entity';
import { IEntity, IMariaDB } from './interface';
import { dataSource } from './ormConfig';

const getEntity = <T>(tableName: Constants): EntityTarget<T> => {
  switch (tableName) {
    case Constants.USER_TABLE:
      return Entity.User;
  }
};

@injectable()
export default class MariaDB implements IMariaDB {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;

  private connection: DataSource;

  public init = async () => {
    this.connection = dataSource;
    await this.connection.initialize();
    this.logger.info(`MariaDB connected: ${this.connection.isInitialized}`);
  };

  public destroy = async () => {
    await this.connection.destroy();
    this.logger.info(`MariaDB connect destroyed: ${!this.connection.isInitialized}`);
  };

  public deleteAll = async (tableName: Constants) => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Could not called deleteAll method in production');
    }

    const queryRunner = this.connection.createQueryRunner();
    try {
      await queryRunner.query(`DELETE FROM ${tableName}`);
    } finally {
      await queryRunner.release();
    }
  };

  public insert = async <T extends IEntity>(tableName: Constants, row: T): Promise<T> => {
    const queryRunner = this.connection.createQueryRunner();
    try {
      const EntityClass = getEntity(tableName);
      await this.connection
        .createQueryBuilder(EntityClass, tableName)
        .setQueryRunner(queryRunner)
        .insert()
        .into(EntityClass)
        .values(row)
        .execute();
      return row;
    } finally {
      await queryRunner.release();
    }
  };

  public findbyID = async <T extends IEntity>(tableName: Constants, id: string | number): Promise<T> => {
    const queryRunner = this.connection.createQueryRunner();
    try {
      const EntityClass = getEntity(tableName);
      const result = await this.connection
        .createQueryBuilder(EntityClass, tableName)
        .setQueryRunner(queryRunner)
        .where({ id })
        .getOne();
      return result as T;
    } finally {
      await queryRunner.release();
    }
  };
}
