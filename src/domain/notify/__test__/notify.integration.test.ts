import request from 'supertest';
import { container } from '../../../container';
import { IWinstonLogger } from '../../../infrastructure/logger/interface';
import { TYPES } from '../../../type';
import { IServer } from '../../../infrastructure/express/interface';
import { INotifyRepository } from '../interface';
import * as util from '../../../util';
import * as config from '../../../config';

const express = container.get<IServer>(TYPES.Server);
const winstonLogger = container.get<IWinstonLogger>(TYPES.WinstonLogger);
const notifyRepository = container.get<INotifyRepository>(TYPES.NotifyRepository);

express.set();
const app = express.getServer();

// Mock
// Notify
const insert = jest.spyOn(notifyRepository, 'insert');
const getNotifyList = jest.spyOn(notifyRepository, 'getNotifyList');
const update = jest.spyOn(notifyRepository, 'update');

const tokenID = util.uuid.generageUUID();
const tokenSet = util.token.getAuthTokenSet({ userID: 1, tokenID }, config.authConfig.issuer);

beforeAll(() => {
  jest.spyOn(winstonLogger, 'debug').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'warn').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'info').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'http').mockImplementation(() => {});
});

afterAll(() => {
  jest.clearAllMocks();
});

const testNotify = {
  id: util.uuid.generageUUID(),
  type: 'openChat',
  isOff: true,
  userID: 1,
};

describe('Get notify list', () => {
  test('Success', () => {
    getNotifyList.mockResolvedValueOnce([testNotify]);

    return request(app)
      .get('/v1/notify')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .expect((response) => {
        const { status, result } = response.body;
        expect(status).toEqual('Success');
        expect(result).toHaveLength(1);
      });
  });
});

describe('Update test', () => {
  test('Success', () => {
    update.mockResolvedValueOnce(testNotify);

    return request(app)
      .patch('/v1/notify')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .send({ type: 'openChat', isOff: true })
      .expect((response) => {
        const { status, result } = response.body;
        expect(status).toEqual('Success');
        expect(result).toEqual(testNotify);
      });
  });

  test('Fail - mismatch type', () => {
    update.mockResolvedValueOnce(testNotify);

    return request(app)
      .patch('/v1/notify')
      .set('Cookie', `accessToken=${tokenSet.accessToken}`)
      .send({ type: 'openchat', isOff: true })
      .expect((response) => {
        const { status, result } = response.body;
        expect(status).toEqual('Error');
        expect(result.name).toEqual('BadRequest');
      });
  });
});
