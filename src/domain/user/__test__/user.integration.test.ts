import { container } from '../../../container';
import { IWinstonLogger } from '../../../infrastructure/logger/interface';
import { TYPES } from '../../../type';
import { IUserRepository, IUserService } from '../interface';

const userService = container.get<IUserService>(TYPES.UserService);
const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
const winstonLogger = container.get<IWinstonLogger>(TYPES.WinstonLogger);

// Mock
const getUserByNickname = jest.spyOn(userRepository, 'getUserByNickname');
const deleteUser = jest.spyOn(userRepository, 'deleteUser');

const testUser = {
  id: 1,
  email: 'test@user.com',
  nickname: 'test',
  profileImage:
    'https://https://cdn.debook.me/image/party/%EB%94%B8%EA%B8%B0%EA%B2%80/52be9e12-2623-4475-ada6-75c37e8e8ed1',
  createdAt: new Date(Date.now()),
  updatedAt: new Date(Date.now()),
};

const unknownUser = {
  id: 0,
  email: 'unknown@user.com',
  nickname: 'unknown',
  profileImage:
    'https://https://cdn.debook.me/image/party/%EB%94%B8%EA%B8%B0%EA%B2%80/52be9e12-2623-4475-ada6-75c37e8e8ed1',
  createdAt: new Date(Date.now()),
  updatedAt: new Date(Date.now()),
};

beforeAll(() => {
  jest.spyOn(winstonLogger, 'debug').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'warn').mockImplementation(() => {});
  jest.spyOn(winstonLogger, 'info').mockImplementation(() => {});
});

afterAll(() => {
  jest.clearAllMocks();
});

describe('Get user profile', () => {
  test('Should return testuser', async () => {
    getUserByNickname.mockResolvedValueOnce(testUser);

    const foundUser = await userService.getUserProfile(testUser.nickname);

    expect(foundUser.nickname).toEqual(testUser.nickname);
    expect(foundUser.email).toEqual(testUser.email);
  });
});

describe('Secession', () => {
  test('Should return testUser', async () => {
    getUserByNickname.mockResolvedValueOnce(testUser);
    deleteUser.mockResolvedValue(null);

    const result = await userService.secession(testUser.id, testUser.nickname);
    expect(result.id).toEqual(testUser.id);
    expect(result.nickname).toEqual(testUser.nickname);
  });

  test('Should return error when user not found', async () => {
    getUserByNickname.mockResolvedValueOnce(unknownUser);
    deleteUser.mockResolvedValue(null);

    const result = await userService.secession(testUser.id, testUser.nickname).catch((error) => {
      expect(error.message).toEqual('AccessDenied');
    });
  });
});
