import { inject, injectable } from 'inversify';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Constants } from '../../../constants';
import { TYPES } from '../../../type';
import { IWinstonLogger } from '../../logger/interface';
import * as Entity from './entity';
import { IEntity, IMariaDB } from './interface';
import { dataSource } from './ormConfig';

const getEntity = <T>(tableName: Constants): EntityTarget<T> => {
  switch (tableName) {
    case Constants.TOKEN_TABLE:
      return Entity.Token;

    case Constants.CERTIFICATION_TABLE:
      return Entity.Certification;

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

  public insert = async <T>(tableName: Constants, rows: Partial<T>): Promise<Partial<T> & IEntity> => {
    const queryRunner = this.connection.createQueryRunner();
    try {
      const EntityClass = getEntity<T>(tableName);
      const result = await this.connection
        .createQueryBuilder<T>(EntityClass, tableName)
        .setQueryRunner(queryRunner)
        .insert()
        .into(EntityClass)
        .values((rows as unknown) as QueryDeepPartialEntity<T>)
        .execute();

      return { id: result.identifiers[0].id, ...rows };
    } finally {
      await queryRunner.release();
    }
  };

  public findbyID = async <T>(tableName: Constants, id: string | number): Promise<T> => {
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

  public findByColumn = async <T>(tableName: Constants, rows: Partial<T>) => {
    const queryRunner = this.connection.createQueryRunner();
    try {
      const EntityClass = getEntity<T>(tableName);
      const result = await this.connection
        .createQueryBuilder<T>(EntityClass, tableName)
        .setQueryRunner(queryRunner)
        .where(rows)
        .getOne();
      return result;
    } finally {
      await queryRunner.release();
    }
  };

  public deleteByColumn = async <T>(tableName: Constants, row: Partial<T>) => {
    const queryRunner = this.connection.createQueryRunner();
    try {
      const EntityClass = getEntity<T>(tableName);
      await this.connection
        .createQueryBuilder<T>(EntityClass, tableName)
        .setQueryRunner(queryRunner)
        .delete()
        .where(row)
        .execute();
    } finally {
      await queryRunner.release();
    }
  };
}
