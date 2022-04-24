import UserEntity from '../../infrastructure/database/maria/entity/user/user';

export interface IUserService {}

export interface IUserRepository {
  insertUser: (email: string, nickname: string) => Promise<Pick<UserEntity, 'email', 'nickname'>>;
  getUserByEmail: (email: string) => Promise<UserEntity>;
  getUserByNickname: (nickname: string) => Promise<UserEntity>;
}
