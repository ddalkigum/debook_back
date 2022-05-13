import { Constants } from '../../../constants';
import { container } from '../../../container';
import { IMariaDB } from '../../../infrastructure/database/maria/interface';
import { TYPES } from '../../../type';
import { IUserRepository } from '../interface';

const mariaDB = container.get<IMariaDB>(TYPES.MariaDB);
const userRepository = container.get<IUserRepository>(TYPES.UserRepository);

beforeAll(async () => {
  await mariaDB.init();
});

afterAll(async () => {
  await mariaDB.deleteAll(Constants.USER_TABLE);
  await mariaDB.destroy();
});

const testUser = {
  email: 'test@email.com',
  nickname: 'test',
};
let userID;

describe('Insert user test', () => {
  test('Should return user email, nickname', async () => {
    const result = await userRepository.insertUser(testUser.email, testUser.nickname);
    userID = result.id;

    expect(result.nickname).toEqual(testUser.nickname);
    expect(result.email).toEqual(testUser.email);
  });
});

describe('Get user Test', () => {
  test('Should return user entity found by id', async () => {
    const foundUser = await userRepository.getUserByID(userID);
    expect(foundUser.id).toEqual(userID);
    expect(foundUser.nickname).toEqual(testUser.nickname);
    expect(foundUser.email).toEqual(testUser.email);
  });

  test('Should return user entity found by column', async () => {
    const foundUser = await userRepository.getUserByNickname(testUser.nickname);
    expect(foundUser.id).toEqual(userID);
    expect(foundUser.nickname).toEqual(testUser.nickname);
    expect(foundUser.email).toEqual(testUser.email);
  });

  test('Should return null when no user trying to find', async () => {
    const foundUser = await userRepository.getUserByID(0);
    expect(foundUser).toBeNull();
  });
});
