import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { inject, injectable } from 'inversify';
import { IServer } from './interface';
import { TYPES } from '../../type';
import { IMorganLogger, IWinstonLogger } from '../logger/interface';
import { IHttpRouter } from '../../domain/interface';
import { IApiResponse } from '../../common/interface';

@injectable()
export class ExpressServer implements IServer {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.MorganLogger) private morganLogger: IMorganLogger;
  @inject(TYPES.ApiResponse) private apiResponse: IApiResponse;

  // Domain
  @inject(TYPES.AuthRouter) private authRouter: IHttpRouter;
  @inject(TYPES.PartyRouter) private partyRouter: IHttpRouter;
  @inject(TYPES.ImageRouter) private imageRouter: IHttpRouter;
  @inject(TYPES.UserRouter) private userRouter: IHttpRouter;

  private app: express.Application = express();

  public getServer = () => {
    return this.app;
  };

  public set = () => {
    this.app.use(helmet());
    this.app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(this.morganLogger.init());

    this.authRouter.init();
    this.partyRouter.init();
    this.imageRouter.init();
    this.userRouter.init();

    this.app.get('/health', (request, response, next) => {
      response.send('Success');
    });

    this.app.use('/v1/auth', this.authRouter.get());
    this.app.use('/v1/party', this.partyRouter.get());
    this.app.use('/v1/image', this.imageRouter.get());
    this.app.use('/v1/user', this.userRouter.get());

    // TODO: Error handler
    this.app.use(this.apiResponse.errorResponse);
  };

  public start = (port: string) => {
    this.app.listen(port);
    this.logger.info(`Server on ${port}, environment: ${process.env.NODE_ENV}`);
  };

  public exit = () => {
    this.logger.info('Terminating');
    try {
      process.exit(0);
    } catch (err) {
      this.logger.error(err);
      process.exit(1);
    }
  };
}
