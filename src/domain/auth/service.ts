import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IUserRepository } from '../user/interface';
import { IAuthRepository, IAuthService } from './interface';
import * as util from '../../util';
import * as config from '../../config';
import { ISES } from '../../infrastructure/aws/ses/interface';

@injectable()
export default class AuthService implements IAuthService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.AuthRepository) private authRepository: IAuthRepository;
  @inject(TYPES.UserRepository) private userRepository: IUserRepository;
  @inject(TYPES.SES) private sesClient: ISES;

  public emailSignup = async (code: string, email: string, nickname: string) => {
    this.logger.debug(`AuthService, emailSignup, code: ${code}, email: ${email}, nickname: ${nickname}`);
    const certification = await this.authRepository.getCertificationByCode(code);

    if (!certification) throw new Error('AccessDenied');
    if (!certification.isSignup) throw new Error('NotSignupCertification');

    const foundUser = await this.userRepository.getUserByNickname(nickname);

    if (foundUser) throw new Error('AlreadyExist');

    await this.userRepository.insertUser(email, nickname);

    const tokenID = util.uuid.generageUUID();
    const tokenSet = util.token.getAuthTokenSet({ userID: foundUser.id, tokenID }, config.authConfig.issuer);
    await this.authRepository.insertToken(foundUser.id, tokenID, tokenSet);

    await this.authRepository.deleteCertificationByCode(code);

    return tokenSet;
  };

  public emailSignin = async (code: string) => {
    this.logger.debug(`AuthService, emailSignin, code: ${code}`);
    const certification = await this.authRepository.getCertificationByCode(code);
    if (!certification) throw new Error('AccessDenied');
    if (certification.isSignup) throw new Error('NotSigninCertification');

    const foundUser = await this.userRepository.getUserByEmail(certification.email);
    if (!foundUser) throw new Error('NotFoundUser');

    const tokenID = util.uuid.generageUUID();
    const tokenSet = util.token.getAuthTokenSet({ userID: foundUser.id, tokenID }, config.authConfig.issuer);

    await this.authRepository.updateToken(foundUser.id, tokenSet);
    await this.authRepository.deleteCertificationByCode(code);
    return tokenSet;
  };

  public sendEmail = async (email: string) => {
    this.logger.debug(`AuthService, sendEmail, email: ${email}`);
    const code = util.hex.generateHexString(10);
    const foundUser = await this.userRepository.getUserByEmail(email);
    let isSignup = foundUser ? false : true;
    // FIXME: 메일 보내는 구조 별로임 구조 수정 필요함
    const baseURL = `http://localhost:3000/v1/auth/${foundUser ? 'signin' : 'signup'}`;

    await this.authRepository.insertCertification(email, code, isSignup);

    this.sesClient.sendAuthEmail(email, code, isSignup, baseURL);
  };

  public checkSignupRequest = async (code: string) => {
    this.logger.debug(`AuthService, checkSignupRequest, code: ${code}`);
    const certification = await this.authRepository.getCertificationByCode(code);
    return { isSignup: certification.isSignup };
  };
}
