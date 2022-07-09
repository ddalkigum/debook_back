import { inject, injectable } from 'inversify';
import NotifyEntity from '../../infrastructure/database/maria/entity/notification/notify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { INotifyService, INotifyRepository } from './interface';

@injectable()
export default class NotifyService implements INotifyService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.NotifyRepository) private notifyRepository: INotifyRepository;

  public getNotifyList = async (userID: number) => {
    this.logger.debug(`NotifyService, getNotifyList`);
    return await this.notifyRepository.getNotifyList(userID);
  };

  public updateNotify = async (userID: number, updateCondition: Partial<NotifyEntity>) => {
    this.logger.debug(`NotifyService, updateNotify`);
    return await this.notifyRepository.update(userID, updateCondition);
  };
}
