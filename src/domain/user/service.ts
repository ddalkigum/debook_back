import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IUserService } from './interface';

@injectable()
export default class UserService implements IUserService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
}
