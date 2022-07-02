import axios from 'axios';
import { google } from 'googleapis';
import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IUserRepository } from '../user/interface';
import { IAuthRepository, IAuthService } from './interface';
import { ISES } from '../../infrastructure/aws/ses/interface';
import ErrorGenerator from '../../common/error';
import * as util from '../../util';
import * as config from '../../config';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_AUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_AUTH_REDIRECT_URL = `${config.serverConfig.baseURL}/v1/auth/redirect/google`;

@injectable()
export default class AuthService implements IAuthService {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.AuthRepository) private authRepository: IAuthRepository;
  @inject(TYPES.UserRepository) private userRepository: IUserRepository;
  @inject(TYPES.SES) private sesClient: ISES;

  public emailSignup = async (code: string, email: string, nickname: string) => {
    this.logger.debug(`AuthService, emailSignup, code: ${code}, email: ${email}, nickname: ${nickname}`);
    const certification = await this.authRepository.getCertificationByCode(code);

    if (!certification) throw ErrorGenerator.badRequest('DoesNotExistCertification');
    if (!certification.isSignup) throw ErrorGenerator.badRequest('AlreadyExistUser');

    const foundUser = await this.userRepository.getUserByNickname(nickname);
    if (foundUser) throw ErrorGenerator.badRequest('AlreadyExistNickname');

    const defaultProfileImage = 'https://cdn.debook.me/default/default_user.png';
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

    const foundToken = await this.authRepository.getTokenByUserID(foundUser.id);
    const tokenSet = util.token.getAuthTokenSet(
      { userID: foundUser.id, tokenID: foundToken.id },
      config.authConfig.issuer
    );

    await this.authRepository.updateToken(foundUser.id, tokenSet);
    await this.authRepository.deleteCertificationByCode(code);
    return { tokenSet, user: foundUser };
  };

  public generateRedirectURL = (provider: string) => {
    const URLGenerator = {
      google: () => {
        const oauth2Client = new google.auth.OAuth2(
          config.authConfig.googleClientID,
          config.authConfig.googleClientSecret,
          'http://localhost:3001/v1/auth/redirect/google'
        );

        const url = oauth2Client.generateAuthUrl({
          scope: 'https://www.googleapis.com/auth/userinfo.email',
        });

        return url;
      },
    };

    return URLGenerator[provider]();
  };

  public googleSignin = async (code: string) => {
    const response = await axios.post(
      GOOGLE_AUTH_TOKEN_URL,
      {},
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
        params: {
          grant_type: 'authorization_code',
          client_id: config.authConfig.googleClientID,
          client_secret: config.authConfig.googleClientSecret,
          redirectUri: GOOGLE_AUTH_REDIRECT_URL,
          code: code,
        },
      }
    );

    const accessToken = response.data['access_token'];
    const getUserResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );
    const { email } = getUserResponse.data;
    const foundUser = await this.userRepository.getUserByEmail(email);

    const certificationID = util.uuid.generageUUID();
    const deleteTime = util.date.setDateTime(60 * 60);
    const certificationCode = util.hex.generateHexString(10);
    const isSignup = foundUser ? false : true;
    const urlPath = foundUser ? 'signin' : 'signup';

    await this.authRepository.insertCertification({
      id: certificationID,
      email,
      code: certificationCode,
      isSignup,
      deleteTime,
    });
    const redirectURL = `${config.clientConfig.baseURL}/${urlPath}?code=${certificationCode}`;
    return redirectURL;
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

    await this.sesClient.sendAuthEmail(email, code, isSignup, baseURL);
    await this.authRepository.insertCertification({ id: certificationID, code, email, isSignup, deleteTime });

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
