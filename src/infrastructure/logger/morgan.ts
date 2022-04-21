import Morgan from 'morgan';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../type';
import { IMorganLogger, IWinstonLogger } from './interface';

@injectable()
export class MorganLogger implements IMorganLogger {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;

  stream: Morgan.StreamOptions = {
    write: (message: any) => this.logger.http(message),
  };

  public init = () => {
    return Morgan(':method :url :status :res[content-length] - :response-time ms', { stream: this.stream });
  };
}
