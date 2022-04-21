import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { inject, injectable } from 'inversify';
import { IServer } from './interface';
import { TYPES } from '../../type';
import { IMorganLogger, IWinstonLogger } from '../logger/interface';

@injectable()
export class ExpressServer implements IServer {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.MorganLogger) private morganLogger: IMorganLogger;

  private app: express.Application = express();

  public getServer = () => {
    return this.app;
  };

  public set = () => {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(this.morganLogger.init());
  };

  public start = (port: string) => {
    this.app.listen(port);
    this.logger.info(`Server on ${port}, environment: ${process.env.NODE_ENV}`);
  };
}
