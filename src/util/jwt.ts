import jwt from 'jsonwebtoken';
import * as config from '../config';
import TokenEntity from '../infrastructure/database/maria/entity/auth/token';

interface AccessTokenPayload {
  userID: number;
}

interface TokenSetPayload {
  userID: number;
  tokenID: string;
}

interface ITokenSet {
  accessToken: string;
  refreshToken: string;
}

const generateAccessToken = (payload: AccessTokenPayload, issuer: string) => {
  return jwt.sign({ user_id: payload.userID }, config.authConfig.jwtSignKey, {
    expiresIn: '2h',
    issuer,
    subject: 'access_token',
  });
};

const generateRefreshToken = (payload: TokenSetPayload, issuer: string) => {
  return jwt.sign({ user_id: payload.userID, token_id: payload.tokenID }, config.authConfig.jwtSignKey, {
    expiresIn: '60d',
    issuer,
    subject: 'refresh_token',
  });
};

const getAuthTokenSet = (payload: TokenSetPayload, issuer: string): Omit<TokenEntity, 'id'> => {
  const accessToken = jwt.sign({ user_id: payload.userID }, config.authConfig.jwtSignKey, {
    expiresIn: '2h',
    issuer,
    subject: 'access_token',
  });

  const refreshToken = jwt.sign({ user_id: payload.userID, token_id: payload.tokenID }, config.authConfig.jwtSignKey, {
    expiresIn: '60d',
    issuer,
    subject: 'refresh_token',
  });

  return { accessToken, refreshToken };
};

export default { generateAccessToken, generateRefreshToken, getAuthTokenSet };
