import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import Joi from 'joi';
import { IApiResponse } from '../../common/interface';
import { IMiddleware } from '../../middleware/interface';
import { TYPES } from '../../type';
import { checkRequired } from '../../util';
import { validateContext } from '../../util/validate';
import { IHttpRouter } from '../interface';
import { IPartyService } from './interface';

@injectable()
export default class PartyRouter implements IHttpRouter {
  @inject(TYPES.ApiResponse) private apiResponse: IApiResponse;
  @inject(TYPES.Middleware) private middleware: IMiddleware;
  @inject(TYPES.PartyService) private partyService: IPartyService;

  private router = Router();

  public init = () => {
    // Get book info
    this.router.get('/search/book', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { title, page } = request.query;
        const schema = Joi.object({
          title: Joi.string().min(3).max(20).required(),
          page: Joi.number().required(),
        });
        validateContext({ title, page }, schema);
        return await this.partyService.searchBook(String(title), Number(page));
      });
    });

    // Get main card list
    this.router.get('/recent', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        return await this.partyService.getMainCardList();
      });
    });

    this.router.get('/participate/:userID', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { userID } = request.params;
        const schema = Joi.string().required();
        validateContext(userID, schema);
        return await this.partyService.getParticipatePartyList(Number(userID));
      });
    });

    this.router.post(
      '/join',
      this.middleware.authorization,
      async (request: Request, response: Response, next: NextFunction) => {
        this.apiResponse.generateResponse(request, response, next, async () => {
          const { userID, partyID } = request.body;
          const schema = Joi.object({
            userID: Joi.number().required(),
            partyID: Joi.string().uuid().required(),
          });
          validateContext(request.body, schema);
          return await this.partyService.joinParty(userID, partyID);
        });
      }
    );

    // Get relation party
    this.router.get('/relation/:bookID', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { bookID } = request.params;
        const schema = Joi.string().required();
        validateContext(bookID, schema);
        return await this.partyService.getRelationPartyList(bookID);
      });
    });

    // Regist party
    this.router.post(
      '/regist',
      this.middleware.authorization,
      async (request: Request, response: Response, next: NextFunction) => {
        this.apiResponse.generateResponse(request, response, next, async () => {
          const { party, book, userID, availableDay } = request.body;
          const schema = Joi.object({
            party: Joi.object({
              title: Joi.string().min(3).max(20).required(),
              numberOfRecruit: Joi.number().min(2).max(6),
              kakaoOpenChatLink: Joi.string().required(),
              kakaoOpenChatPassword: Joi.string().optional(),
              region: Joi.string().optional(),
              city: Joi.string().optional(),
              town: Joi.string().optional(),
              isOnline: Joi.boolean().required(),
              description: Joi.string().required(),
            }),
            book: Joi.object({
              id: Joi.string().required(),
              title: Joi.string().required(),
              authors: Joi.array().required(),
              thumbnail: Joi.string().optional(),
            }),
            userID: Joi.number().required(),
            availableDay: Joi.array().required(),
          });
          validateContext(request.body, schema);
          await this.partyService.registParty({ party, book, ownerID: userID, availableDay });
        });
      }
    );

    // Get party detail
    this.router.get(
      '/:nickname/:URLSlug',
      this.middleware.checkLogin,
      async (request: Request, response: Response, next: NextFunction) => {
        this.apiResponse.generateResponse(request, response, next, async () => {
          const { nickname, URLSlug } = request.params;
          const { userID } = request.body;
          const schema = Joi.object({
            nickname: Joi.string().required(),
            URLSlug: Joi.string().required(),
          });
          validateContext(request.params, schema);

          return await this.partyService.getPartyDetail(nickname, URLSlug, userID);
        });
      }
    );
  };

  public get = () => {
    return this.router;
  };
}