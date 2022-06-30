import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IApiResponse } from '../../common/interface';
import { IMiddleware } from '../../middleware/interface';
import { TYPES } from '../../type';
import { IHttpRouter } from '../interface';
import { IAuthService } from './interface';
import * as config from '../../config';
import Joi from 'joi';
import { validateContext } from '../../util/validate';

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
        const schema = Joi.string().email().required();

        validateContext(email, schema);
        return await this.authService.sendEmail(email);
      });
    });

    // GET /v1/auth/signin/email?code=?
    this.router.get('/signin/email', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const code = request.query.code as string;
        const schema = Joi.string().required();

        validateContext(code, schema);
        const result = await this.authService.emailSignin(code);
        // TODO: domain setting 추가 해야됨
        response.cookie('accessToken', result.tokenSet.accessToken, {
          domain:
            process.env.NODE_ENV === 'production' ? config.serverConfig.baseURL.replace('https://api', '.') : undefined,
          httpOnly: true,
          maxAge: config.authConfig.maxAge.accessToken,
        });
        response.cookie('refreshToken', result.tokenSet.refreshToken, {
          domain:
            process.env.NODE_ENV === 'production' ? config.serverConfig.baseURL.replace('https://api', '.') : undefined,
          httpOnly: true,
          maxAge: config.authConfig.maxAge.refreshToken,
        });
        return result.user;
      });
    });

    this.router.get(
      '/verify',
      this.middleware.authorization,
      async (request: Request, response: Response, next: NextFunction) => {
        response.send('Success');
      }
    );

    // GET /v1/auth/check?code=?
    this.router.get('/check', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const code = request.query.code as string;
        const schema = Joi.string().required();

        validateContext(code, schema);
        return await this.authService.checkSignupRequest(code);
      });
    });

    // POST /v1/auth/signup/email
    this.router.post('/signup/email', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { code, email, nickname } = request.body;
        const schema = Joi.object({
          code: Joi.string().required(),
          email: Joi.string().email().required(),
          nickname: Joi.string().required(),
        });

        validateContext(request.body, schema);
        const signupResult = await this.authService.emailSignup(code, email, nickname);
        const { tokenSet, user } = signupResult;

        response.cookie('accessToken', tokenSet.accessToken, {
          domain:
            process.env.NODE_ENV === 'production' ? config.serverConfig.baseURL.replace('https://api', '.') : undefined,
          httpOnly: true,
          maxAge: config.authConfig.maxAge.accessToken,
        });
        response.cookie('refreshToken', tokenSet.refreshToken, {
          domain:
            process.env.NODE_ENV === 'production' ? config.serverConfig.baseURL.replace('https://api', '.') : undefined,
          httpOnly: true,
          maxAge: config.authConfig.maxAge.refreshToken,
        });
        return user;
      });
    });

    this.router.delete('/logout', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        response.clearCookie('accessToken');
        response.clearCookie('refreshToken');
        return 'Success';
      });
    });
  };

  public get = () => {
    return this.router;
  };
}
