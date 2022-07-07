import NotifyEntity from '../../infrastructure/database/maria/entity/notification/notify';

export interface INotifyService {
  getNotifyList: (userID: number) => Promise<NotifyEntity[]>;
  updateNotify: (userID: number, updateCondtion: Partial<NotifyEntity>) => Promise<Partial<NotifyEntity>>;
}

export interface INotifyRepository {
  insert: (context: NotifyEntity) => Promise<Partial<NotifyEntity>>;
  getNotifyList: (userID: number) => Promise<NotifyEntity[]>;
  update: (userID: number, updateCondition: Partial<NotifyEntity>) => Promise<Partial<NotifyEntity>>;
}
