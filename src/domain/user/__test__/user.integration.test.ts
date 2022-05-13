import { container } from '../../../container';
import { TYPES } from '../../../type';
import { IUserRepository, IUserService } from '../interface';

const userService = container.get<IUserService>(TYPES.UserService);
const userRepository = container.get<IUserRepository>(TYPES.UserRepository);

// Mock
const getUserByNickname = jest.spyOn(userRepository, 'getUserByNickname');
const deleteUser = jest.spyOn(userRepository, 'deleteUser');

const testUser = {
  id: 1,
  email: 'test@user.com',
  nickname: 'test',
};

const unknownUser = {
  id: 0,
  email: 'unknown@user.com',
  nickname: 'unknown',
};

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
