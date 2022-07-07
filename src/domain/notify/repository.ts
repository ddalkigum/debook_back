import { inject, injectable } from 'inversify';
import { Constants } from '../../constants';
import NotifyEntity from '../../infrastructure/database/maria/entity/notification/notify';
import { IMariaDB } from '../../infrastructure/database/maria/interface';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { INotifyRepository } from './interface';

@injectable()
export default class NotifyRepository implements INotifyRepository {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.MariaDB) private mariaDB: IMariaDB;

  public insert = async (context: NotifyEntity) => {
    this.logger.debug(`NotifyRepository, insert, context: ${JSON.stringify(context)}`);
    return await this.mariaDB.insert<NotifyEntity>(Constants.NOTIFY_TABLE, context);
  };

  public getNotifyList = async (userID: number) => {
    this.logger.debug(`NotifyService, getNotifyList`);
    return await this.mariaDB.findByColumn<NotifyEntity>(Constants.NOTIFY_TABLE, { userID });
  };

  public update = async (userID: number, updateCondition: Partial<NotifyEntity>) => {
    this.logger.debug(`NotifyService, updateNotify`);
    return await this.mariaDB.updateByColumn<NotifyEntity>(Constants.NOTIFY_TABLE, { userID }, updateCondition);
  };
}
