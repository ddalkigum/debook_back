import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IAuthRepository, IAuthService } from './interface';
import * as util from '../../util';
import * as config from '../../config';

@injectable()
export default class AuthService implements IAuthService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.AuthRepository) private authRepository: IAuthRepository;

  public setAuthCode = async (email: string) => {
    this.logger.debug(`AuthService, setAuthCode`);
    const code = util.generateHexString(10);

    await this.authRepository.insertAuthCode(email, code);
    return code;
  };

  public getEmail = async (code: string) => {
    this.logger.debug(`AuthService, getAuthCode`);
    const email = await this.authRepository.getEmailOnRedis(code);

    await this.authRepository.deleteAuthCode(code);
    return email;
  };

  public sendEmail = async (email: string, code: string) => {};

  public setToken = async (userID: number) => {
    this.logger.debug(`AuthService, settoken`);
    // 1. Generate accessToken -> Random hex -> RefreshToken
    const accessToken = util.generateAccessToken({ userID }, config.serverConfig.baseURL);
    const tokenID = util.generateHexString(10);
    const refreshToken = util.generateRefreshToken({ userID, tokenID }, config.serverConfig.baseURL);

    // 2. Insert token
    return await this.authRepository.insertToken(tokenID, accessToken, refreshToken);
  };

  public login = async (email: string) => {
    // TODO: UserRepository.findUserByEmail
    const userFound = true;
    // !User -> insert user -> insert token
    let user;
    if (!userFound) {
      user = { id: 1 };
      // const user = this.userRepository.insertUser(email)
    }
    const accessToken = util.generateAccessToken({ userID: user.id }, config.serverConfig.baseURL);
    const tokenID = util.generageUUID();
    const refreshToken = util.generateRefreshToken({ userID: user.id, tokenID }, config.serverConfig.baseURL);

    if (!userFound) {
      await this.authRepository.insertToken(tokenID, accessToken, refreshToken);
    } else {
      await this.authRepository.updateToken();
    }

    // User -> update token
  };
}
