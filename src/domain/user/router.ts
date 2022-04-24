import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../type';
import { IHttpRouter } from '../interface';

@injectable()
export default class UserRouter implements IHttpRouter {
  private router = Router();

  public init = () => {};

  public get = () => {
    return this.router;
  };
}
