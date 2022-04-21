import jwt from 'jsonwebtoken';
import * as config from '../config';

interface AccessTokenPayload {
  userID: number;
}

interface RefreshTokenPayload {
  userID: number;
  tokenID: string;
}

const generateAccessToken = (payload: AccessTokenPayload, issuer: string) => {
  return jwt.sign({ user_id: payload.userID }, config.authConfig.jwtSignKey, {
    expiresIn: '2h',
    issuer,
    subject: 'access_token',
  });
};

const generateRefreshToken = (payload: RefreshTokenPayload, issuer: string) => {
  return jwt.sign({ user_id: payload.userID, token_id: payload.tokenID }, config.authConfig.jwtSignKey, {
    expiresIn: '60d',
    issuer,
    subject: 'refresh_token',
  });
};

export { generateAccessToken, generateRefreshToken };
