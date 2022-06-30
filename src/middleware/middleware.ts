import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import * as config from '../config';
import * as util from '../util';
import { IAuthRepository } from '../domain/auth/interface';
import { IMiddleware } from './interface';
import { TYPES } from '../type';
import ErrorGenerator from '../common/error';
import { IS3Client } from '../infrastructure/aws/s3/interface';

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
  @inject(TYPES.S3Client) private s3Client: IS3Client;

  public authorization = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken } = request.cookies;
      if (accessToken) {
        const { userID, isExpired } = verifyToken(accessToken);
        if (!isExpired) {
          request.body.userID = userID;
          return next();
        }
      }

      if (!refreshToken) {
        const error = ErrorGenerator.unAuthorized('TokenRequired');
        return next(error);
      }

      const { userID, tokenID } = verifyToken(refreshToken);

      const foundTokenSet = await this.authRepository.getTokenByID(tokenID);

      if (!foundTokenSet) {
        const error = ErrorGenerator.unAuthorized('UnavailableToken');
        return next(error);
      }

      const newAccessToken = util.token.generateAccessToken({ userID }, config.authConfig.issuer);
      const tokenSet = { accessToken: newAccessToken, refreshToken };

      // Update token
      await this.authRepository.updateToken(userID, tokenSet);
      request.body.userID = userID;
      response.cookie('accessToken', tokenSet.accessToken, {
        domain:
          process.env.NODE_ENV === 'production' ? config.serverConfig.baseURL.replace('https://api', '') : undefined,
        httpOnly: true,
        maxAge: config.authConfig.maxAge.accessToken,
      });
      response.cookie('refreshToken', tokenSet.refreshToken, {
        domain:
          process.env.NODE_ENV === 'production' ? config.serverConfig.baseURL.replace('https://api', '') : undefined,
        httpOnly: true,
        maxAge: config.authConfig.maxAge.refreshToken,
      });
      return next();
    } catch (error) {
      response.clearCookie('accessToken');
      response.clearCookie('refreshToken');
      next(error);
    }
  };

  public checkLogin = async (request: Request, response: Response, next: NextFunction) => {
    const { accessToken, refreshToken } = request.cookies;
    try {
      if (!accessToken) {
        // 로그인 안한 경우
        if (!refreshToken) {
          return next();
        }

        const { tokenID, userID } = verifyToken(refreshToken);
        const foundToken = await this.authRepository.getTokenByID(tokenID);

        if (!foundToken) {
          return next();
        }

        const newAccessToken = util.token.generateAccessToken({ userID }, config.authConfig.issuer);
        await this.authRepository.updateToken(userID, { accessToken: newAccessToken });
        request.body.userID = userID;
        response.cookie('accessToken', newAccessToken, {
          domain:
            process.env.NODE_ENV === 'production' ? config.serverConfig.baseURL.replace('https://api', '') : undefined,
          httpOnly: true,
          maxAge: config.authConfig.maxAge.accessToken,
        });
        return next();
      }

      const { userID } = verifyToken(accessToken);
      request.body.userID = userID;
      return next();
    } catch (error) {
      next();
    }
  };
}
