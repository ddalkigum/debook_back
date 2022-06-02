import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import * as config from '../config';
import * as util from '../util';
import { IAuthRepository, TokenSet } from '../domain/auth/interface';
import { IMiddleware } from './interface';
import { TYPES } from '../type';
import ErrorGenerator from '../common/error';

const verifyToken = (token: string) => {
  let isExpired = false;
  try {
    const { issuer } = config.authConfig;
    const verifiedToken: any = jwt.verify(token, config.authConfig.jwtSignKey, { issuer });
    return { ...verifiedToken, isExpired };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { isExpired: true };
    }
    throw error;
  }
};

@injectable()
export default class Middleware implements IMiddleware {
  @inject(TYPES.AuthRepository) private authRepository: IAuthRepository;

  public authorization = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken } = request.cookies;
      if (!accessToken || !refreshToken) {
        const error = ErrorGenerator.unAuthorized('TokenRequired');
        next(error);
      }
      const foundTokenSet = await this.authRepository.getTokenByAccessToken(accessToken);

      if (!foundTokenSet) {
        const error = ErrorGenerator.unAuthorized('UnavailableToken');
        next(error);
      }

      const verifiedAcessToken = verifyToken(accessToken);
      if (!verifiedAcessToken.isExpired) {
        request.body.userID = verifiedAcessToken.userID;
        next();
      }

      const verifiedRefreshToken = verifyToken(refreshToken);

      const { userID } = verifiedAcessToken;
      const tokenID = util.uuid.generageUUID();

      let tokenSet: TokenSet;
      if (verifiedRefreshToken.isExpired) {
        // generate token set
        tokenSet = util.token.getAuthTokenSet({ userID, tokenID }, config.authConfig.issuer);
      } else {
        // generate access token
        const newAccessToken = util.token.generateAccessToken({ userID }, config.authConfig.issuer);
        tokenSet = { accessToken: newAccessToken, refreshToken };
      }

      // Update token
      await this.authRepository.updateToken(userID, tokenSet);
      response.cookie('accessToken', tokenSet.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 7 * 24 });
      response.cookie('refreshToken', tokenSet.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 7 * 24 });
      next();
    } catch (error) {
      next(error);
    }
  };
}
