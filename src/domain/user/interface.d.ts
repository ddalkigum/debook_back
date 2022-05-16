import UserEntity from '../../infrastructure/database/maria/entity/user/user';

export interface IUserService {
  getUserProfile: (nickname: string) => Promise<UserEntity>;
  secession: (userID: number, nickname: string) => Promise<Pick<UserEntity, 'id' | 'nickname'>>;
}

export interface IUserRepository {
  insertUser: (email: string, nickname: string) => Promise<Pick<UserEntity, 'id' | 'email', 'nickname'>>;
  getUserByID: (id: number) => Promise<UserEntity>;
  getUserByNickname: (nickname: string) => Promise<UserEntity>;
  getUserByEmail: (email: string) => Promise<UserEntity>;
  deleteUser: (userID: number) => Promise<>;
}
