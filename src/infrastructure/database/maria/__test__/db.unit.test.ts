import { Constants } from '../../../../constants';
import { container } from '../../../../container';
import { TYPES } from '../../../../type';
import { IMariaDB } from '../interface';
import * as Entity from '../entity';
import UserEntity from '../entity/user/user';

const mariaDB: IMariaDB = container.get(TYPES.MariaDB);

beforeAll(async () => {
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
    await mariaDB.insert<UserEntity>(Constants.USER_TABLE, { id, email, nickname });
    const user = await mariaDB.findbyID<Entity.User>(Constants.USER_TABLE, id);

    expect(user.id).toEqual(id);
  });
});
