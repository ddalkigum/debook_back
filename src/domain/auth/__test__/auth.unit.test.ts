import jwt from 'jsonwebtoken';
import { Constants } from '../../../constants';
import { container } from '../../../container';
import { IMariaDB } from '../../../infrastructure/database/maria/interface';
import { TYPES } from '../../../type';
import { IUserRepository } from '../../user/interface';
import { IAuthRepository } from '../interface';
import * as util from '../../../util';

const userRepository: IUserRepository = container.get(TYPES.UserRepository);
const authRepository: IAuthRepository = container.get(TYPES.AuthRepository);
const mariaDB: IMariaDB = container.get(TYPES.MariaDB);

beforeAll(async () => {
  await mariaDB.init();
});

afterAll(async () => {
  await mariaDB.deleteAll(Constants.CERTIFICATION_TABLE);
  await mariaDB.deleteAll(Constants.TOKEN_TABLE);
  await mariaDB.deleteAll(Constants.USER_TABLE);
  await mariaDB.destroy();
});

const testSignupCertification = {
  code: util.hex.generateHexString(10),
  email: 'signup@user.com',
  isSignup: true,
};

const testSigninCertification = {
  code: util.hex.generateHexString(10),
  email: 'signin@user.com',
  isSignup: false,
};

describe('Certification test', () => {
  // insert certification test
  test('InsertCertification, Should return certification', async () => {
    const { code, email, isSignup } = testSignupCertification;
    const certification = await authRepository.insertCertification(code, email, isSignup);

    expect(certification.code).toEqual(testSignupCertification.code);
    expect(certification.email).toEqual(testSignupCertification.email);
    expect(certification.isSignup).toEqual(testSignupCertification.isSignup);
  });

  // get certificationby code
  test('GetCertificationByCode, Should return certification entity', async () => {
    const { code, email, isSignup } = testSignupCertification;
    const certification = await authRepository.getCertificationByCode(code);

    expect(certification.code).toEqual(code);
    expect(certification.email).toEqual(email);
    expect(certification.isSignup).toEqual(isSignup);
  });

  test('GetCertificationByCode, Should return null', async () => {
    const certification = await authRepository.getCertificationByCode('code');
    expect(certification).toBeNull();
  });

  // delete certification code
  test('DeleteCertificationByCode, Should return null', async () => {
    const { code } = testSignupCertification;
    await authRepository.deleteCertificationByCode(code);

    const certification = await authRepository.getCertificationByCode(code);
    expect(certification).toBeNull();
  });
});

describe('Token test', () => {
  const userID = 1;
  const tokenID = util.uuid.generageUUID();
  const tokenSet = util.token.getAuthTokenSet({ userID, tokenID }, 'testIssuer');

  // insert token
  test('InsertToken, Should return token set', async () => {
    const token = await authRepository.insertToken(userID, tokenID, tokenSet);
    expect(token.accessToken).toEqual(tokenSet.accessToken);
    expect(token.refreshToken).toEqual(tokenSet.refreshToken);
    const issuer = jwt.decode(token.refreshToken);
    console.log(`issuer: ${issuer}`);
  });

  // get token
  test('GetTokenByAccessToken, Should return token entity', async () => {
    const foundToken = await authRepository.getTokenByAccessToken(tokenSet.accessToken);
    expect(foundToken.userID).toEqual(userID);
    expect(foundToken.accessToken).toEqual(tokenSet.accessToken);
    expect(foundToken.refreshToken).toEqual(tokenSet.refreshToken);
  });

  test('GetTokenByAccessToken, Should return null', async () => {
    const foundToken = await authRepository.getTokenByAccessToken('fakeAccessToken');
    expect(foundToken).toBeNull();
  });

  // update token
  test('UpdateToken, Should return updated token', async () => {
    const newTokenSet = util.token.getAuthTokenSet({ userID, tokenID }, 'testIssuer');
    const updatedToken = await authRepository.updateToken(userID, newTokenSet);
  });
});
