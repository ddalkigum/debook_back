import { Constants } from '../../../constants';
import { container } from '../../../container';
import { IMariaDB } from '../../../infrastructure/database/maria/interface';
import { TYPES } from '../../../type';
import { IUserRepository } from '../../user/interface';
import { IAuthRepository } from '../interface';
import * as util from '../../../util';
import { IWinstonLogger } from '../../../infrastructure/logger/interface';

const userRepository: IUserRepository = container.get(TYPES.UserRepository);
const authRepository: IAuthRepository = container.get(TYPES.AuthRepository);
const winstonLogger: IWinstonLogger = container.get(TYPES.WinstonLogger);
const mariaDB: IMariaDB = container.get(TYPES.MariaDB);

beforeAll(async () => {
  jest.spyOn(winstonLogger, 'debug').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'warn').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'info').mockImplementation(() => {});
  await mariaDB.init();
});

afterAll(async () => {
  await mariaDB.deleteAll(Constants.CERTIFICATION_TABLE);
  await mariaDB.deleteAll(Constants.TOKEN_TABLE);
  await mariaDB.deleteAll(Constants.USER_TABLE);
  await mariaDB.destroy();
});

const testSignupCertification = {
  id: util.uuid.generageUUID(),
  code: util.hex.generateHexString(10),
  email: 'signup@user.com',
  isSignup: true,
  deleteTime: util.date.setDateTime(60 * 60),
};

const testSigninCertification = {
  code: util.hex.generateHexString(10),
  email: 'signin@user.com',
  isSignup: false,
};

describe('Certification test', () => {
  // insert certification test
  test('InsertCertification, Should return certification', async () => {
    const certification = await authRepository.insertCertification(testSignupCertification);

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
  let userID;
  const testUser = {
    email: 'test@user.com',
    nickname: '딸기검',
    profileImage: 'https://...',
  };

  beforeAll(async () => {
    const insertResult = await userRepository.insertUser(testUser.email, testUser.nickname, testUser.profileImage);
    userID = insertResult.id;
  });

  const tokenID = util.uuid.generageUUID();
  const tokenSet = util.token.getAuthTokenSet({ userID, tokenID }, 'testIssuer');

  // insert token
  test('InsertToken, Should return token set', async () => {
    const token = await authRepository.insertToken(userID, tokenID, tokenSet);
    expect(token.accessToken).toEqual(tokenSet.accessToken);
    expect(token.refreshToken).toEqual(tokenSet.refreshToken);
  });

  // get token
  test('GetTokenByAccessToken, Should return token entity', async () => {
    const foundToken = await authRepository.getTokenByAccessToken(tokenSet.accessToken);
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
    const foundToken = await authRepository.getTokenByAccessToken(updatedToken.accessToken);

    expect(foundToken.accessToken).toEqual(newTokenSet.accessToken);
    expect(foundToken.refreshToken).toEqual(newTokenSet.refreshToken);
  });
});
