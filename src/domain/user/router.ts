import { NextFunction, Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IApiResponse } from '../../common/interface';
import { IMiddleware } from '../../middleware/interface';
import { TYPES } from '../../type';
import { IHttpRouter } from '../interface';
import { IUserService } from './interface';
import * as util from '../../util';
import Joi from 'joi';
import { validateContext } from '../../util/validate';

@injectable()
export default class UserRouter implements IHttpRouter {
  @inject(TYPES.ApiResponse) private apiResponse: IApiResponse;
  @inject(TYPES.Middleware) private middleware: IMiddleware;
  @inject(TYPES.UserService) private userService: IUserService;

  private router = Router();

  public init = () => {
    this.router.get(
      '/current',
      this.middleware.checkLogin,
      async (request: Request, response: Response, next: NextFunction) => {
        this.apiResponse.generateResponse(request, response, next, async () => {
          const { userID } = request.body;
          const schema = Joi.object({
            userID: Joi.number().required(),
          });

          validateContext(request.body, schema);
          if (userID) {
            return await this.userService.getUserProfile({ userID });
          }
          return 'Success';
        });
      }
    );

    this.router.get('/profile/:nickname', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { nickname } = request.params;
        const schema = Joi.object({
          nickname: Joi.string().required(),
        });

        validateContext(request.params, schema);
        const user = this.userService.getUserProfile({ nickname });
        return user;
      });
    });

    this.router.patch(
      '/profile',
      this.middleware.authorization,
      async (request: Request, response: Response, next: NextFunction) => {
        this.apiResponse.generateResponse(request, response, next, async () => {
          const { userID, profileImage } = request.body;
          const regex = /https:\/\/cdn.debook.me/;
          const schema = Joi.object({
            userID: Joi.number().required(),
            profileImage: Joi.string().regex(regex).required(),
          });

          validateContext(request.body, schema);
          const user = this.userService.updateUser(userID, { profileImage });
          return user;
        });
      }
    );

    this.router.delete(
      '',
      this.middleware.authorization,
      async (request: Request, response: Response, next: NextFunction) => {
        this.apiResponse.generateResponse(request, response, next, async () => {
          const { userID } = request.body;
          const schema = Joi.number().required();

          validateContext(userID, schema);
          await this.userService.deactivate(userID);
          response.clearCookie('accessToken');
          response.clearCookie('refreshToken');
          return 'Success';
        });
      }
    );
  };

  public get = () => {
    return this.router;
  };
}
