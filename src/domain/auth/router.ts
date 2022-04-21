import { NextFunction, Request, Response, Router } from 'express';
import { injectable } from 'inversify';
import { IHttpRouter } from '../interface';

@injectable()
export default class AuthRouter implements IHttpRouter {
  private router = Router();

  public init = () => {
    this.router.get('/health', (request: Request, response: Response, next: NextFunction) => {
      return response.send('Success');
    });

    // TODO: Send email
    this.router.get('/');

    // TODO: Email Login

    // TODO: Google login
  };

  public get = () => {
    return this.router;
  };
}
