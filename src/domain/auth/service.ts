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

  public getAuthCode = async (code: string) => {
    this.logger.debug(`AuthService, getAuthCode`);
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
}
