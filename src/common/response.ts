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

  public errorResponse = (error: BaseError, request: Request, response: Response, next: NextFunction) => {
    if (!error.statusCode) {
      error = ErrorGenerator.internalServerError();
      error.statusCode = 500;
    }

    if (error.statusCode < 500) {
      this.logger.warn(`name: ${error.name}, message: ${error.message}`);
    } else {
      this.logger.error(`name: ${error.name}, message: ${error.message}, stack: ${error.stack}`);
    }

    response.json({
      status: 'Error',
      result: {
        name: error.name,
        message: error.message,
      },
    });
  };
}
