import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IApiResponse } from '../../common/interface';
import { TYPES } from '../../type';
import { checkRequired } from '../../util';
import { IHttpRouter } from '../interface';
import { IPartyService } from './interface';

@injectable()
export default class PartyRouter implements IHttpRouter {
  @inject(TYPES.ApiResponse) private apiResponse: IApiResponse;
  @inject(TYPES.PartyService) private partyService: IPartyService;

  private router = Router();

  public init = () => {
    // Get book info
    this.router.get('/search/book', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { title, page } = request.query;
        checkRequired([title]);
        return await this.partyService.searchBook(String(title), Number(page));
      });
    });

    // Get main card list
    this.router.get('/recent', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        return await this.partyService.getMainCardList();
      });
    });

    // Get relation party
    this.router.get('/relation/:bookID', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { bookID } = request.params;
        checkRequired([bookID]);
        return await this.partyService.getRelationPartyList(bookID);
      });
    });

    // Get party detail
    this.router.get('/:nickname/:partyTitle', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { nickname, partyTitle } = request.params;
        const { userID } = request.body;
        checkRequired([nickname, partyTitle]);

        return await this.partyService.getPartyDetail(nickname, partyTitle, userID);
      });
    });

    // Regist party
    this.router.post('/regist', async (request: Request, response: Response, next: NextFunction) => {
      this.apiResponse.generateResponse(request, response, next, async () => {
        const { party, book, userID, availableDay } = request.body;
        const { title, memberOfRecruit, isOnline, description, location } = party;
        checkRequired([title, memberOfRecruit, availableDay, isOnline, book, description]);
        // regist party
        this.partyService.registParty({ party, book, ownerID: userID, availableDay });
      });
    });
  };

  public get = () => {
    return this.router;
  };
}
