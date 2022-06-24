import { inject, injectable } from 'inversify';
import ErrorGenerator from '../../common/error';
import UserEntity from '../../infrastructure/database/maria/entity/user/user';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IUserRepository, IUserService } from './interface';

@injectable()
export default class UserService implements IUserService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.UserRepository) private userRepository: IUserRepository;

  public getUserProfile = async (option: { nickname?: string; userID?: number }) => {
    this.logger.debug(`UserService, getUserProfile`);
    let foundUser;
    const { nickname, userID } = option;
    if (nickname) {
      foundUser = await this.userRepository.getUserByNickname(nickname);
    } else {
      foundUser = await this.userRepository.getUserByID(userID);
    }

    if (!foundUser) {
      const error = ErrorGenerator.notFound();
      throw error;
    }

    return foundUser;
  };

  public updateUser = async (userID: number, updateCondition: Partial<UserEntity>) => {
    this.logger.debug(`UserService, updateUser`);
    return await this.userRepository.updateUser(userID, updateCondition);
  };

  public secession = async (userID: number, nickname: string) => {
    const foundUser = await this.userRepository.getUserByNickname(nickname);

    if (foundUser.id !== userID) throw new Error('AccessDenied');

    await this.userRepository.deleteUser(userID);

    return { id: userID, nickname };
  };
}
