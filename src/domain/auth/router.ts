import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IHttpRouter } from '../interface';
import { TYPES } from '../../type';
import { IAuthService } from './interface';
import { Constants } from '../../constants';
import * as util from '../../util';
import * as config from '../../config';

@injectable()
export default class AuthRouter implements IHttpRouter {
  @inject(TYPES.AuthService) private authService: IAuthService;

  private router = Router();

  public init = () => {
    this.router.get('/health', (request: Request, response: Response, next: NextFunction) => {
      return response.send('Success');
    });

    this.router.post('/send-email', async (request: Request, response: Response, next: NextFunction) => {
      const { email } = request.body;
      util.checkRequired([email]);

      const code = util.hex.generateHexString(10);
      const status = await this.authService.setCertification(email, code);
      await this.authService.sendEmail(code, email, status);
    });

    this.router.get('/check', async (request: Request, response: Response, next: NextFunction) => {
      const code = request.query.code as string;
      const certification = await this.authService.getCertification(code);

      if (!certification) {
        return 'DoesNotExist';
      }

      return certification;
    });

    this.router.get('/signin/email', async (request: Request, response: Response, next: NextFunction) => {
      const code = request.query.code as string;
      util.checkRequired([code]);

      const certification = await this.authService.getCertification(code);

      if (!certification) {
        return 'DoesNotExist';
      }

      if (certification.status !== Constants.SIGNIN) {
        return 'IncorrectAccess';
      }

      const result = await this.authService.signin(code, certification.email);
      response.cookie(Constants.ACCESS_TOKEN, result.accessToken, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
      return { nickname: result.nickname, email: result.email };
    });

    this.router.post('/signup/email', async (request: Request, response: Response, next: NextFunction) => {
      const { code, email, nickname } = request.body;

      util.checkRequired([code, email, nickname]);

      const certification = await this.authService.getCertification(code);

      if (!certification) {
        return 'DoesNotExist';
      }

      if (certification.status !== Constants.SIGNIN) {
        return 'IncorrectAccess';
      }

      const result = await this.authService.signup(code, email, nickname);
      response.cookie(Constants.ACCESS_TOKEN, result.accessToken, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });

      return { nickname: result.nickname, email: result.email };
    });

    // TODO: Google login, url 정리 ( config로 )
    this.router.get('/signin/google', async (request: Request, response: Response, next: NextFunction) => {
      const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
      const GOOGLE_AUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
      const GOOGLE_AUTH_REDIRECT_URL = 'http://localhost:3001/api/v1/user/login/google/redirect';
      response.redirect(
        `${GOOGLE_AUTH_URL}?client_id=${config.authConfig.googleClientID}?redirect_uri=${GOOGLE_AUTH_REDIRECT_URL}&response_type=code&include_granted_scopes=true&scope=https://www.googleapis.com/auth/userinfo.email`
      );
    });

    this.router.get('/signin/google/redirect', async (request: Request, response: Response, next: NextFunction) => {
      const { code } = request.query;
    });
  };

  public get = () => {
    return this.router;
  };
}
