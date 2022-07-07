import * as Util from '../';

describe('Access token test', () => {
  const payload = {
    userID: 1,
  };
  const issuer = 'debook';
  test('Should return access token', () => {
    const accessToken = Util.token.generateAccessToken(payload, issuer);
    expect(accessToken.startsWith('ey')).toBeTruthy();
  });
});

describe('Refresh token test', () => {
  const payload = {
    userID: 1,
    tokenID: Util.uuid.generageUUID(),
  };
  const issuer = 'debook';

  test('Should return refresh token', () => {
    const refreshToken = Util.token.generateRefreshToken(payload, issuer);
    expect(refreshToken.startsWith('ey')).toBeTruthy();
  });
});
