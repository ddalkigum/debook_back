type ErrorName = 'BadRequest' | 'Unauthorized' | 'Forbidden' | 'NotFound' | 'InternalServerError';
type ErrorStatusCode = 400 | 401 | 403 | 404 | 500;

export class BaseError extends Error {
  public statusCode: ErrorStatusCode;
  public name: ErrorName;
  constructor(message: string) {
    super();
    this.message = message;
  }
}

export default class ErrorGenerator {
  static badRequest = (message: string) => {
    const error = new BaseError(message);
    error.name = 'BadRequest';
    error.statusCode = 400;
    return error;
  };

  static unAuthorized = (message: string) => {
    const error = new BaseError(message);
    error.name = 'Unauthorized';
    error.statusCode = 401;
    return error;
  };

  static forbidden = (message: string) => {
    const error = new BaseError(message);
    error.name = 'Forbidden';
    error.statusCode = 403;
    return error;
  };

  static notFound = () => {
    const error = new BaseError('NotFound');
    error.name = 'NotFound';
    error.statusCode = 404;
    return error;
  };

  static internalServerError = () => {
    const error = new BaseError('InternalServerError');
    error.name = 'InternalServerError';
    error.statusCode = 500;
    return error;
  };
}
