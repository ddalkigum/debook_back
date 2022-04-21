import { inject, injectable } from 'inversify';
import { DataSource } from 'typeorm';
import { TYPES } from '../../../type';
import { IWinstonLogger } from '../../logger/interface';
import { IMariaDB } from './interface';
import { connectionOption } from './ormConfig';

@injectable()
export default class MariaDB implements IMariaDB {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  private connection: DataSource;

  public init = async () => {
    this.connection = new DataSource(connectionOption);
    await this.connection.initialize();
    this.logger.info(`MariaDB connected: ${this.connection.isInitialized}`);
  };

  public close = async () => {
    console.log('close');
  };
}
