import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IApiResponse } from '../../common/interface';
import { IMiddleware } from '../../middleware/interface';
import { TYPES } from '../../type';
import { checkRequired } from '../../util';
import { IHttpRouter } from '../interface';
import { IAuthService } from './interface';

@injectable()
export default class AuthRouter implements IHttpRouter {
  @inject(TYPES.ApiResponse) private apiResponse: IApiResponse;
  @inject(TYPES.Middleware) private middleware: IMiddleware;
  @inject(TYPES.AuthService) private authService: IAuthService;

  private router = Router();

  public init = () => {
    // POST /v1/auth/send-email
    this.router.post('/send-email', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { email } = request.body;
        checkRequired([email]);
        return await this.authService.sendEmail(email);
      });
    });

    // GET /v1/auth/signin/email?code=?
    this.router.get('/signin/email', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const code = request.query.code as string;
        checkRequired([code]);

        const tokenSet = await this.authService.emailSignin(code);
        // TODO: domain setting 추가 해야됨
        response.cookie('accessToken', tokenSet.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 7 * 24 });
        response.cookie('refreshToken', tokenSet.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 7 * 24 });
      });
    });

    this.router.get(
      '/check/login',
      this.middleware.authorization,
      async (request: Request, response: Response, next: NextFunction) => {
        this.apiResponse.generateResponse(request, response, next, async () => {
          return 'Success';
        });
      }
    );

    // GET /v1/auth/check?code=?
    this.router.get('/check', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const code = request.query.code as string;
        return await this.authService.checkSignupRequest(code);
      });
    });

    // POST /v1/auth/signup/email
    this.router.post('/signup/email', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { code, email, nickname } = request.body;
        checkRequired([code, email, nickname]);

        const signupResult = await this.authService.emailSignup(code, email, nickname);
        const { tokenSet, user } = signupResult;

        // TODO: domain setting 추가 해야됨
        response.cookie('accessToken', tokenSet.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 7 * 24 });
        response.cookie('refreshToken', tokenSet.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 7 * 24 });
        return user;
      });
    });
  };

  public get = () => {
    return this.router;
  };
}
