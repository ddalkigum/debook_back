import { NextFunction, Request, Response } from 'express';
import { UploadType } from '../infrastructure/aws/s3/interface';

export interface IMiddleware {
  authorization: (request: Request, response: Response, next: NextFunction) => Promise<void>;
  checkLogin: (request: Request, response: Response, next: Nextfunction) => void;
}
