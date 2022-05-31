import { NextFunction, Request, Response } from 'express';

type ErrorCode = 400 | 401 | 403 | 404 | 500;

interface BaseResponse<T> {
  status: string;
  result: any;
}

export interface IApiResponse {
  generateResponse: (request: Request, response: Response, next: NextFunction, func: any) => Promise<void>;
  errorResponse: (error: BaseError, request: Request, response: Response, next: NextFunction) => void;
}
