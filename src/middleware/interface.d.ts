import { NextFunction, Request, Response } from 'express';

export interface IMiddleware {
  authorization: (request: Request, response: Response, next: NextFunction) => Promise<void>;
}
