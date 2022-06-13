import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IWinstonLogger } from '../infrastructure/logger/interface';
import { TYPES } from '../type';
import ErrorGenerator, { BaseError } from './error';
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
      next(error);
    }
  };

  public generateNotFound = (request: Request, response: Response, next: NextFunction) => {
    const error = ErrorGenerator.notFound();
    next(error);
  };

  public errorResponse = (error: BaseError | Error, request: Request, response: Response, next: NextFunction) => {
    if (error instanceof BaseError) {
      this.logger.warn(`name: ${error.name}, message: ${error.message}`);
    } else {
      error['statusCode'] = 500;
      this.logger.error(`name: ${error.name}, message: ${error.message}, stack: ${JSON.stringify(error.stack)}`);
    }

    response.status(error['statusCode']).json({
      status: 'Error',
      result: {
        name: error.name,
        message: error.message,
      },
    });
  };
}
