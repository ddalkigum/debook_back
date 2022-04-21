import { Constants } from '../../../../constants';
import { container } from '../../../../container';
import { TYPES } from '../../../../type';
import { IMariaDB } from '../interface';
import * as Entity from '../entity';

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
    await mariaDB.insert(Constants.USER_TABLE, { id });
    const user = await mariaDB.findbyID<Entity.User>(Constants.USER_TABLE, id);

    expect(user.id).toEqual(id);
  });
});
