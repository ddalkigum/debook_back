import jwt, { TokenExpiredError } from 'jsonwebtoken';
import * as config from '../config';
import { TokenSet } from '../domain/auth/interface';

interface AccessTokenPayload {
  userID: number;
}

interface TokenSetPayload {
  userID: number;
  tokenID: string;
}

const generateAccessToken = (payload: AccessTokenPayload, issuer: string) => {
  return jwt.sign({ userID: payload.userID }, config.authConfig.jwtSignKey, {
    expiresIn: '1h',
    issuer,
    subject: 'access_token',
  });
};

const generateRefreshToken = (payload: TokenSetPayload, issuer: string) => {
  return jwt.sign({ userID: payload.userID, tokenID: payload.tokenID }, config.authConfig.jwtSignKey, {
    expiresIn: '30d',
    issuer,
    subject: 'refresh_token',
  });
};

const getAuthTokenSet = (payload: TokenSetPayload, issuer: string): TokenSet => {
  const accessToken = jwt.sign({ userID: payload.userID }, config.authConfig.jwtSignKey, {
    expiresIn: '1h',
    issuer,
    subject: 'access_token',
  });

  const refreshToken = jwt.sign({ userID: payload.userID, tokenID: payload.tokenID }, config.authConfig.jwtSignKey, {
    expiresIn: '30d',
    issuer,
    subject: 'refresh_token',
  });

  return { accessToken, refreshToken };
};

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

export default { generateAccessToken, generateRefreshToken, getAuthTokenSet, verifyToken };
