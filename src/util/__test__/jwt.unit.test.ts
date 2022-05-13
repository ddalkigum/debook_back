import * as Util from '../';
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
    const accessToken = Util.token.generateAccessToken(payload, issuer);
    logger.debug(accessToken);
    expect(accessToken.startsWith('ey')).toBeTruthy();
  });
});

describe('Refresh token test', () => {
  const payload = {
    userID: 1,
    tokenID: Util.uuid.generageUUID(),
  };
  const issuer = 'goback';

  test('Should return refresh token', () => {
    const refreshToken = Util.token.generateRefreshToken(payload, issuer);
    logger.debug(refreshToken);
    expect(refreshToken.startsWith('ey')).toBeTruthy();
  });
});
