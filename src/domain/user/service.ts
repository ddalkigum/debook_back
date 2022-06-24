import { inject, injectable } from 'inversify';
import ErrorGenerator from '../../common/error';
import { IS3Client } from '../../infrastructure/aws/s3/interface';
import UserEntity from '../../infrastructure/database/maria/entity/user/user';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IAuthRepository } from '../auth/interface';
import { IUserRepository, IUserService } from './interface';

@injectable()
export default class UserService implements IUserService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.UserRepository) private userRepository: IUserRepository;
  @inject(TYPES.AuthRepository) private authRepository: IAuthRepository;
  @inject(TYPES.S3Client) private s3Client: IS3Client;

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

  public deactivate = async (userID: number) => {
    this.logger.debug(`UserService, deactivate`);
    const foundUser = await this.userRepository.getUserByID(userID);

    if (!foundUser) throw ErrorGenerator.badRequest('DoesNotExistUser');

    await this.authRepository.deleteToken(userID);
    await this.userRepository.deleteUser(userID);

    // TODO: 이미지 삭제 방법, 당장 급하진 않음
    // 1. ImageEntity 생성, userID에 있는 image deleteObjects로 처리
    // this.s3Client.deleteContent(foundUser.nickname);
  };
}
