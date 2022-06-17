import { Constants } from '../../../constants';
import { container } from '../../../container';
import { IMariaDB } from '../../../infrastructure/database/maria/interface';
import { IWinstonLogger } from '../../../infrastructure/logger/interface';
import { TYPES } from '../../../type';
import { IUserRepository } from '../interface';

const mariaDB = container.get<IMariaDB>(TYPES.MariaDB);
const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
const winstonLogger = container.get<IWinstonLogger>(TYPES.WinstonLogger);

beforeAll(async () => {
  jest.spyOn(winstonLogger, 'warn').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'info').mockImplementation(() => {});
  // jest.spyOn(winstonLogger, 'debug').mockImplementation(() => {});
  await mariaDB.init();
});

afterAll(async () => {
  await mariaDB.deleteAll(Constants.USER_TABLE);
  await mariaDB.destroy();
});

const testUser = {
  email: 'test@email.com',
  nickname: 'test',
  profileImage: 'https://...',
};
let userID;

describe('Insert user test', () => {
  test('Should return user email, nickname', async () => {
    const result = await userRepository.insertUser(testUser.email, testUser.nickname, testUser.profileImage);
    userID = result.id;
    console.log('result:', result);
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
