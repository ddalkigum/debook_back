import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../infrastructure/logger/interface';
import { TYPES } from '../type';
import { IApiResponse } from './interface';

@injectable()
export default class ApiResponse implements IApiResponse {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;

  public generateResponse = async (
    request: Request,
    response: Response,
    next: NextFunction,
    func: any
  ): Promise<void> => {
    try {
      const result = await func();
      response.status(200).json({
        status: 'Success',
        result,
      });
    } catch (error) {
      this.logger.error(error);
      next(error);
    }
  };
}
