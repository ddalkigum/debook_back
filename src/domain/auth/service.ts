import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IUserRepository } from '../user/interface';
import { IAuthRepository, IAuthService } from './interface';
import * as util from '../../util';
import * as config from '../../config';
import { ISES } from '../../infrastructure/aws/ses/interface';
import ErrorGenerator from '../../common/error';

@injectable()
export default class AuthService implements IAuthService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.AuthRepository) private authRepository: IAuthRepository;
  @inject(TYPES.UserRepository) private userRepository: IUserRepository;
  @inject(TYPES.SES) private sesClient: ISES;

  public emailSignup = async (code: string, email: string, nickname: string) => {
    this.logger.debug(`AuthService, emailSignup, code: ${code}, email: ${email}, nickname: ${nickname}`);
    const certification = await this.authRepository.getCertificationByCode(code);

    if (!certification) throw ErrorGenerator.badRequest('Does not exist certification');
    if (!certification.isSignup) throw ErrorGenerator.badRequest('AlreadyExistUser');

    const foundUser = await this.userRepository.getUserByNickname(nickname);
    if (foundUser) throw ErrorGenerator.badRequest('AlreadyExistUser');

    const defaultProfileImage =
      'https://https://cdn.debook.me/image/party/%EB%94%B8%EA%B8%B0%EA%B2%80/52be9e12-2623-4475-ada6-75c37e8e8ed1';
    const signupUser = await this.userRepository.insertUser(email, nickname, defaultProfileImage);

    const tokenID = util.uuid.generageUUID();
    const tokenSet = util.token.getAuthTokenSet({ userID: signupUser.id, tokenID }, config.authConfig.issuer);
    await this.authRepository.insertToken(signupUser.id, tokenID, tokenSet);

    await this.authRepository.deleteCertificationByCode(code);

    return { tokenSet, user: signupUser };
  };

  public emailSignin = async (code: string) => {
    this.logger.debug(`AuthService, emailSignin, code: ${code}`);
    const certification = await this.authRepository.getCertificationByCode(code);
    if (!certification) {
      const error = ErrorGenerator.badRequest('DoesNotExistCertification');
      throw error;
    }

    if (certification.isSignup) {
      const error = ErrorGenerator.badRequest('SignupCertification');
      throw error;
    }

    const foundUser = await this.userRepository.getUserByEmail(certification.email);
    if (!foundUser) {
      const error = ErrorGenerator.badRequest('DoesNotExistUser');
      throw error;
    }

    const tokenID = util.uuid.generageUUID();
    const tokenSet = util.token.getAuthTokenSet({ userID: foundUser.id, tokenID }, config.authConfig.issuer);

    await this.authRepository.updateToken(foundUser.id, tokenSet);
    await this.authRepository.deleteCertificationByCode(code);
    return { tokenSet, user: foundUser };
  };

  public sendEmail = async (email: string) => {
    this.logger.debug(`AuthService, sendEmail, email: ${email}`);
    const code = util.hex.generateHexString(10);
    const foundUser = await this.userRepository.getUserByEmail(email);
    let isSignup = foundUser ? false : true;
    // FIXME: 메일 보내는 구조 별로임 구조 수정 필요함
    const baseURL = `${config.clientConfig.baseURL}/${foundUser ? 'signin' : 'signup'}`;

    const certificationID = util.uuid.generageUUID();
    const deleteTime = util.date.setDateTime(60 * 60);

    await this.authRepository.insertCertification({ id: certificationID, code, email, isSignup, deleteTime });

    this.sesClient.sendAuthEmail(email, code, isSignup, baseURL);
    return 'Success';
  };

  public checkSignupRequest = async (code: string) => {
    this.logger.debug(`AuthService, checkSignupRequest, code: ${code}`);
    const certification = await this.authRepository.getCertificationByCode(code);

    if (!certification) throw ErrorGenerator.unAuthorized('DoesNotExistCertification');

    const { isSignup, email } = certification;
    return { isSignup, email };
  };
}
