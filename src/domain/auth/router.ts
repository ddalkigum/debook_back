import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IHttpRouter } from '../interface';
import * as util from '../../util';
import { TYPES } from '../../type';
import { IAuthService } from './interface';

@injectable()
export default class AuthRouter implements IHttpRouter {
  @inject(TYPES.AuthService) private authService: IAuthService;

  private router = Router();

  public init = () => {
    this.router.get('/health', (request: Request, response: Response, next: NextFunction) => {
      return response.send('Success');
    });

    // TODO: Send email - use aws ses
    this.router.post('/send-email', async (request: Request, response: Response, next: NextFunction) => {
      const { email } = request.body;
      util.checkRequired([email]);
      // Send Email
      const code = await this.authService.setAuthCode(email);
      return await this.authService.sendEmail(email, code);
    });

    // TODO: Email Login
    this.router.get('/email', (request: Request, response: Response, next: NextFunction) => {
      const { code } = request.query;
    });

    // TODO: Google login
  };

  public get = () => {
    return this.router;
  };
}
