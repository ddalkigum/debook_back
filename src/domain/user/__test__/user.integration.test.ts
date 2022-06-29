import request from 'supertest';
import { container } from '../../../container';
import { IServer } from '../../../infrastructure/express/interface';
import { IWinstonLogger } from '../../../infrastructure/logger/interface';
import { TYPES } from '../../../type';
import { IAuthRepository } from '../../auth/interface';
import { IUserRepository, IUserService } from '../interface';
import * as util from '../../../util';
import * as config from '../../../config';

const express = container.get<IServer>(TYPES.Server);
const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
const authRepository = container.get<IAuthRepository>(TYPES.AuthRepository);
const winstonLogger = container.get<IWinstonLogger>(TYPES.WinstonLogger);

express.set();
const app = express.getServer();

// Mock
const getUserByNickname = jest.spyOn(userRepository, 'getUserByNickname');
const getUserByID = jest.spyOn(userRepository, 'getUserByID');
const updateUser = jest.spyOn(userRepository, 'updateUser');
const deleteToken = jest.spyOn(authRepository, 'deleteToken');
const deleteUser = jest.spyOn(userRepository, 'deleteUser');

const tokenID = util.uuid.generageUUID();
const tokenSet = util.token.getAuthTokenSet({ userID: 1, tokenID }, config.authConfig.issuer);

const testUser = {
  id: 1,
  email: 'test@user.com',
  nickname: 'test',
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

afterAll(() => {
  jest.clearAllMocks();
});

describe('Get current user', () => {
  test('Success', async () => {
    getUserByID.mockResolvedValueOnce(testUser);

    return request(app)
      .get('/v1/user/current')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        expect(response.body.result.id).toEqual(testUser.id);
        expect(response.body.result.email).toEqual(testUser.email);
        expect(response.body.result.nickname).toEqual(testUser.nickname);
      });
  });

  test('Fail - NotFound', async () => {
    getUserByID.mockResolvedValueOnce(null);

    return request(app)
      .get('/v1/user/current')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        expect(response.body.result.name).toEqual('NotFound');
      });
  });
});

describe('Get user profile', () => {
  test('Success', () => {
    getUserByNickname.mockResolvedValueOnce(testUser);

    return request(app)
      .get(`/v1/user/profile/${testUser.nickname}`)
      .expect((response) => {
        expect(response.body.result.id).toEqual(testUser.id);
        expect(response.body.result.email).toEqual(testUser.email);
        expect(response.body.result.nickname).toEqual(testUser.nickname);
      });
  });
});

describe('Update user', () => {
  test('Success', async () => {
    updateUser.mockResolvedValueOnce({ profileImage: testUser.profileImage });

    return request(app)
      .patch('/v1/user/profile')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .send({ profileImage: testUser.profileImage })
      .expect((response) => {
        expect(response.body.result.profileImage).toEqual(testUser.profileImage);
      });
  });

  test('Fail - Invalid profile image url', () => {
    return request(app)
      .patch('/v1/user/profile')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .send({ profileImage: 'https://test.com' })
      .expect((response) => {
        expect(response.body.result.name).toEqual('BadRequest');
      });
  });
});

describe('Deactivate', () => {
  test('Success', async () => {
    getUserByID.mockResolvedValueOnce(testUser);
    deleteToken.mockResolvedValue(null);
    deleteUser.mockResolvedValue(null);

    return request(app)
      .delete('/v1/user')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        expect(response.body.result).toEqual('Success');
      });
  });

  test('Fail - DoesNotExistUser', async () => {
    getUserByID.mockResolvedValueOnce(null);

    return request(app)
      .delete('/v1/user')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        expect(response.body.result.name).toEqual('BadRequest');
        expect(response.body.result.message).toEqual('DoesNotExistUser');
      });
  });
});
