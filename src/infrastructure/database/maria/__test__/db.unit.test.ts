import { Constants } from '../../../../constants';
import { container } from '../../../../container';
import { TYPES } from '../../../../type';
import { IMariaDB } from '../interface';
import * as Entity from '../entity';
import UserEntity from '../entity/user/user';
import { IWinstonLogger } from '../../../logger/interface';

const mariaDB: IMariaDB = container.get(TYPES.MariaDB);
const winstonLogger: IWinstonLogger = container.get(TYPES.WinstonLogger);

beforeAll(async () => {
  jest.spyOn(winstonLogger, 'debug').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'warn').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'info').mockImplementation(() => {});
  await mariaDB.init();
});

afterAll(async () => {
  await mariaDB.deleteAll(Constants.USER_TABLE);
  await mariaDB.destroy();
});

describe('InsertTest', () => {
  test('Success insert', async () => {
    const id = 1;
    const email = 'sol35352000@gmail.com';
    const nickname = '10글자닉네임입니다';
    const profileImage =
      'https://cdn.debook.me/image/party/%EB%94%B8%EA%B8%B0%EA%B2%80/52be9e12-2623-4475-ada6-75c37e8e8ed1';
    await mariaDB.insert<UserEntity>(Constants.USER_TABLE, { id, email, nickname, profileImage });
    const user = await mariaDB.findbyID<Entity.User>(Constants.USER_TABLE, id);

    expect(user.id).toEqual(id);
  });
});
