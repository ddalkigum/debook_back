import { NextFunction, Router, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IApiResponse } from '../../common/interface';
import { IMiddleware } from '../../middleware/interface';
import { TYPES } from '../../type';
import { IHttpRouter } from '../interface';
import { IUserService } from './interface';

@injectable()
export default class UserRouter implements IHttpRouter {
  @inject(TYPES.ApiResponse) private apiResponse: IApiResponse;
  @inject(TYPES.Middleware) private middleware: IMiddleware;
  @inject(TYPES.UserService) private userService: IUserService;

  private router = Router();

  public init = () => {
    this.router.get('/profile/:nickname', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { nickname } = request.params;
        const user = this.userService.getUserProfile({ nickname });
        return user;
      });
    });
  };

  public get = () => {
    return this.router;
  };
}
