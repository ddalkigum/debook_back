import { Request, Response, NextFunction, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IMariaDB } from '../../infrastructure/database/maria/interface';
import { TYPES } from '../../type';
import { IHttpRouter } from '../interface';

@injectable()
export default class HealthCheckRouter implements IHttpRouter {
  @inject(TYPES.MariaDB) private mariaDB: IMariaDB;

  private router = Router();

  public init = () => {
    this.router.get('/db', (request: Request, response: Response, next: NextFunction) => {
      this.mariaDB;
    });
  };

  public get = () => {
    return this.router;
  };
}
