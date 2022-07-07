import request from 'supertest';
import { container } from '../../../container';
import { IWinstonLogger } from '../../../infrastructure/logger/interface';
import { TYPES } from '../../../type';
import { IAuthRepository, IAuthService } from '../../auth/interface';
import { IUserRepository } from '../../user/interface';
import * as util from '../../../util';
import * as config from '../../../config';
import CertificationEntity from '../../../infrastructure/database/maria/entity/auth/certification';
import { IHttpRouter } from '../../interface';
import { IServer } from '../../../infrastructure/express/interface';
import { ISES } from '../../../infrastructure/aws/ses/interface';
import TokenEntity from '../../../infrastructure/database/maria/entity/auth/token';
import { IMiddleware } from '../../../middleware/interface';

const express = container.get<IServer>(TYPES.Server);
const winstonLogger = container.get<IWinstonLogger>(TYPES.WinstonLogger);
const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
const authRepository = container.get<IAuthRepository>(TYPES.AuthRepository);
const sesClient = container.get<ISES>(TYPES.SES);
const middleware = container.get<IMiddleware>(TYPES.Middleware);

express.set();
const app = express.getServer();

// Mock
// Auth
const getCertificationByCode = jest.spyOn(authRepository, 'getCertificationByCode');
const getTokenByUserID = jest.spyOn(authRepository, 'getTokenByUserID');
const insertToken = jest.spyOn(authRepository, 'insertToken');
const deleteCertificationByCode = jest.spyOn(authRepository, 'deleteCertificationByCode');
const insertCertification = jest.spyOn(authRepository, 'insertCertification');
const updateToken = jest.spyOn(authRepository, 'updateToken');

// SES
const sendAuthEmail = jest.spyOn(sesClient, 'sendAuthEmail');

// User
const getUserByNickname = jest.spyOn(userRepository, 'getUserByNickname');
const getUserByEmail = jest.spyOn(userRepository, 'getUserByEmail');
const insertUser = jest.spyOn(userRepository, 'insertUser');

// Middleware
const testUser = {
  id: 1,
  email: 'sol35352000@gmail.com',
  nickname: 'test',
  profileImage: 'https://cdn.debook.me/image/party/%EB%94%B8%EA%B8%B0%EA%B2%80/52be9e12-2623-4475-ada6-75c37e8e8ed1',
  createdAt: new Date(Date.now()),
  updatedAt: new Date(Date.now()),
};

const certificationID = util.uuid.generageUUID();

const tokenID = util.uuid.generageUUID();
const tokenSet = util.token.getAuthTokenSet({ userID: 1, tokenID }, config.authConfig.issuer);

const safeTokenEntity: TokenEntity = {
  id: 'testTokenID',
  accessToken: tokenSet.accessToken,
  refreshToken: tokenSet.refreshToken,
  userID: 1,
};

const signupCertification: CertificationEntity = {
  id: certificationID,
  email: testUser.email,
  code: util.hex.generateHexString(6),
  isSignup: true,
  deleteTime: util.date.setDateTime(60 * 60),
};

const signinCertification: CertificationEntity = {
  id: certificationID,
  email: testUser.email,
  code: util.hex.generateHexString(6),
  isSignup: false,
  deleteTime: util.date.setDateTime(60 * 60),
};

const unknownUser = {
  id: 2,
  email: 'unknown@user.com',
  nickname: 'unknown',
  profileImage: 'https://cdn.debook.me/image/party/%EB%94%B8%EA%B8%B0%EA%B2%80/52be9e12-2623-4475-ada6-75c37e8e8ed1',
  createdAt: new Date(Date.now()),
  updatedAt: new Date(Date.now()),
};

beforeAll(() => {
  jest.spyOn(winstonLogger, 'debug').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'warn').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'info').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'http').mockImplementation(() => {});
});

describe('Send email test', () => {
  test('Success', () => {
    sendAuthEmail.mockResolvedValueOnce();
    getUserByEmail.mockResolvedValueOnce(testUser);
    insertCertification.mockResolvedValueOnce(signupCertification);

    return request(app)
      .post('/v1/auth/send-email')
      .send({ email: 'sol35352000@gmail.com' })
      .expect((response) => {
        expect(response.body.result).toEqual('Success');
      });
  });
});

describe('Email signin test', () => {
  test('Success', () => {
    getCertificationByCode.mockResolvedValueOnce(signinCertification);
    getUserByEmail.mockResolvedValueOnce(testUser);
    getTokenByUserID.mockResolvedValueOnce(safeTokenEntity);
    updateToken.mockResolvedValueOnce(safeTokenEntity);
    deleteCertificationByCode.mockResolvedValueOnce();

    return request(app)
      .get('/v1/auth/signin/email?code=code')
      .expect((response) => {
        const { id, email, nickname, profileImage } = response.body.result;
        expect(id).toEqual(testUser.id);
        expect(email).toEqual(testUser.email);
        expect(nickname).toEqual(testUser.nickname);
        expect(profileImage).toEqual(testUser.profileImage);
      });
  });

  test('Fail - code required', () => {
    return request(app)
      .get('/v1/auth/signin/email')
      .expect((response) => {
        expect(response.body.result.name).toEqual('BadRequest');
      });
  });

  test('Fail - DoesNotExistCertification', () => {
    getCertificationByCode.mockResolvedValueOnce(null);

    return request(app)
      .get('/v1/auth/signin/email?code=code')
      .expect((response) => {
        expect(response.body.result.message).toEqual('DoesNotExistCertification');
      });
  });

  test('Fail - SignupCertification', () => {
    getCertificationByCode.mockResolvedValueOnce(signupCertification);

    return request(app)
      .get('/v1/auth/signin/email?code=code')
      .expect((response) => {
        expect(response.body.result.message).toEqual('SignupCertification');
      });
  });

  test('Fail - DoesNotExistUser', () => {
    getCertificationByCode.mockResolvedValueOnce(signinCertification);
    getUserByEmail.mockResolvedValueOnce(null);

    return request(app)
      .get('/v1/auth/signin/email?code=code')
      .expect((response) => {
        expect(response.body.result.message).toEqual('DoesNotExistUser');
      });
  });
});

describe('Verify test', () => {
  test('Success', () => {
    return request(app)
      .get('/v1/auth/verify')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        expect(response.text).toEqual('Success');
      });
  });
});

describe('Email signup test', () => {
  test('Success Should return user entity', () => {
    getCertificationByCode.mockResolvedValueOnce(signupCertification);
    getUserByNickname.mockResolvedValueOnce(null);
    insertUser.mockResolvedValueOnce(testUser);
    insertToken.mockResolvedValueOnce(safeTokenEntity);
    deleteCertificationByCode.mockResolvedValueOnce();

    return request(app)
      .post('/v1/auth/signup/email')
      .send({ code: signupCertification.code, email: testUser.email, nickname: testUser.nickname })
      .expect((response) => {
        const { id, email, nickname, profileImage } = response.body.result;
        expect(id).toEqual(testUser.id);
        expect(email).toEqual(testUser.email);
        expect(nickname).toEqual(testUser.nickname);
        expect(profileImage).toEqual(testUser.profileImage);
      });
  });

  test('Fail - Should return DoesNotExistCertification', () => {
    getCertificationByCode.mockResolvedValueOnce(null);

    return request(app)
      .post('/v1/auth/signup/email')
      .send({ code: signupCertification.code, email: testUser.email, nickname: testUser.nickname })
      .expect((response) => {
        expect(response.body.result.message).toEqual('DoesNotExistCertification');
      });
  });

  test('Fail - Should return AlreadyExistUser', () => {
    getCertificationByCode.mockResolvedValueOnce(signinCertification);

    return request(app)
      .post('/v1/auth/signup/email')
      .send({ code: signupCertification.code, email: testUser.email, nickname: testUser.nickname })
      .expect((response) => {
        expect(response.body.result.message).toEqual('AlreadyExistUser');
      });
  });

  test('Fail - Should return AlreadyExistNickname', () => {
    getCertificationByCode.mockResolvedValueOnce(signupCertification);
    getUserByNickname.mockResolvedValueOnce(testUser);

    return request(app)
      .post('/v1/auth/signup/email')
      .send({ code: signupCertification.code, email: testUser.email, nickname: testUser.nickname })
      .expect((response) => {
        expect(response.body.result.message).toEqual('AlreadyExistNickname');
      });
  });
});

describe('Check signup request', () => {
  test('Success', () => {
    getCertificationByCode.mockResolvedValueOnce(signupCertification);

    return request(app)
      .get('/v1/auth/check?code=code')
      .expect((response) => {
        expect(response.body.result.isSignup).toEqual(signupCertification.isSignup);
        expect(response.body.result.email).toEqual(signupCertification.email);
      });
  });

  test('Fail - DoesNotExistCertification', () => {
    getCertificationByCode.mockResolvedValueOnce(null);

    return request(app)
      .get('/v1/auth/check?code=code')
      .expect((response) => {
        expect(response.body.result.name).toEqual('Unauthorized');
        expect(response.body.result.message).toEqual('DoesNotExistCertification');
      });
  });
});

describe('Logout test', () => {
  test('Success', () => {
    return request(app)
      .delete('/v1/auth/logout')
      .expect((response) => {
        expect(response.body.result).toEqual('Success');
      });
  });
});
