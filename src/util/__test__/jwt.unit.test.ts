import * as util from '../';
import { container } from '../../container';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';

const logger: IWinstonLogger = container.get(TYPES.WinstonLogger);

describe('Access token test', () => {
  const payload = {
    userID: 1,
  };
  const issuer = 'goback';
  test('Should return access token', () => {
    const accessToken = util.jwtUtil.generateAccessToken(payload, issuer);
    logger.debug(accessToken);
    expect(accessToken.startsWith('ey')).toBeTruthy();
  });
});

describe('Refresh token test', () => {
  const payload = {
    userID: 1,
    tokenID: util.generageUUID(),
  };
  const issuer = 'goback';

  test('Should return refresh token', () => {
    const refreshToken = util.jwtUtil.generateRefreshToken(payload, issuer);
    logger.debug(refreshToken);
    expect(refreshToken.startsWith('ey')).toBeTruthy();
  });
});
