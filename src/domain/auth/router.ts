import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IHttpRouter } from '../interface';
import * as util from '../../util';
import { TYPES } from '../../type';
import { IAuthService } from './interface';
import { Constants } from '../../constants';

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
      const code = util.generateHexString(10);
      const status = await this.authService.setCertification(email, code);
      await this.authService.sendEmail(status, email, code);
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
      response.cookie(Constants.ACCESS_TOKEN, result.accessToken, { maxAge: 1000 * 60 * 60 * 24 * 7 });
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
      response.cookie(Constants.ACCESS_TOKEN, result.accessToken, { maxAge: 1000 * 60 * 60 * 24 * 7 });

      return { nickname: result.nickname, email: result.email };
    });

    // TODO: Google login
  };

  public get = () => {
    return this.router;
  };
}
