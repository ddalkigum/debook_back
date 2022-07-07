import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import Joi from 'joi';
import { IApiResponse } from '../../common/interface';
import { IMiddleware } from '../../middleware/interface';
import { TYPES } from '../../type';
import { validateContext } from '../../util/validate';
import { IHttpRouter } from '../interface';
import { INotifyService } from './interface';

@injectable()
export default class NotifyRouter implements IHttpRouter {
  @inject(TYPES.ApiResponse) private apiResponse: IApiResponse;
  @inject(TYPES.Middleware) private middleware: IMiddleware;
  @inject(TYPES.NotifyService) private notifyService: INotifyService;

  private router = Router();

  public init = () => {
    // Get book info
    this.router.get(
      '',
      this.middleware.authorization,
      async (request: Request, response: Response, next: NextFunction) => {
        this.apiResponse.generateResponse(request, response, next, async () => {
          const { userID } = request.body;
          const schema = Joi.object({
            userID: Joi.number().required(),
          });

          validateContext(request.body, schema);
          return await this.notifyService.getNotifyList(userID);
        });
      }
    );

    this.router.patch(
      '',
      this.middleware.authorization,
      async (request: Request, response: Response, next: NextFunction) => {
        this.apiResponse.generateResponse(request, response, next, async () => {
          const { userID, type, isOff } = request.body;

          const schema = Joi.object({
            userID: Joi.number().required(),
            type: Joi.string().valid('openChat').required(),
            isOff: Joi.boolean().required(),
          });

          validateContext(request.body, schema);
          return await this.notifyService.updateNotify(userID, { type, isOff });
        });
      }
    );
  };

  public get = () => {
    return this.router;
  };
}
