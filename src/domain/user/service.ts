import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IUserRepository, IUserService } from './interface';

@injectable()
export default class UserService implements IUserService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.UserRepository) private userRepository: IUserRepository;

  public getUserProfile = async (nickname: string) => {
    const foundUser = await this.userRepository.getUserByNickname(nickname);

    if (!foundUser) throw new Error('NotFound');

    // TODO: 현재 유저가 참가중인 파티 리스트 가지고 와야함
    const partyList = [{ id: 'uuid', title: '제목' }];

    return foundUser;
  };

  public secession = async (userID: number, nickname: string) => {
    const foundUser = await this.userRepository.getUserByNickname(nickname);

    if (foundUser.id !== userID) throw new Error('AccessDenied');

    await this.userRepository.deleteUser(userID);

    return { id: userID, nickname };
  };
}
