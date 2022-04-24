import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IAuthRepository, IAuthService } from './interface';
import * as util from '../../util';
import * as config from '../../config';
import { Constants } from '../../constants';
import TokenEntity from '../../infrastructure/database/maria/entity/auth/token';

@injectable()
export default class AuthService implements IAuthService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.AuthRepository) private authRepository: IAuthRepository;

  public setAuthCode = async (email: string) => {
    this.logger.debug(`AuthService, setAuthCode`);
    const code = util.generateHexString(10);

    await this.authRepository.insertCertification(email, code);
    return code;
  };

  public sendEmail = async (email: string, code: string) => {};

  public getCertification = async (code: string) => {
    this.logger.debug(`AuthService, getAuthCode`);
    const certification = await this.authRepository.getCertification(code);

    return certification;
  };

  public signup = async (code: string, email: string, nickname: string) => {
    // Insert user
    const user = await this.userRepository.insertUser(email, nickname);
    // Insert token
    const tokenID = util.uuid();
    const { accessToken, refreshToken } = util.token.getAuthTokenSet(
      { userID: user.id, tokenID },
      config.serverConfig.baseURL
    );

    await this.authRepository.insertToken(accessToken, refreshToken, tokenID, user.id);
    // Delete certification
    await this.authRepository.deleteCertification(code);

    return { accessToken, refreshToken, nickname, email };
  };

  public signin = async (code: string, email: string) => {
    // Get user
    const user = await this.userRepository.getUser(email);
    // Update token
    const tokenID = util.uuid();
    const { accessToken, refreshToken } = util.token.getAuthTokenSet(
      { userID: user.id, tokenID },
      config.serverConfig.baseURL
    );
    await this.authRepository.updateToken(accessToken, refreshToken, user.id);
    // Delete certification

    await this.authRepository.deleteCertification(code);

    return { accessToken, refreshToken, nickname: user.nickname, email };
  };
}
