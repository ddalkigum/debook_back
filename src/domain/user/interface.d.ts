import { DateTimeEntity } from '../../infrastructure/database/maria/entity/datetime';
import UserEntity from '../../infrastructure/database/maria/entity/user/user';

export type InsertUser = Omit<UserEntity, keyof DateTimeEntity>;

export interface IUserService {
  getUserProfile: (option: { nickname?: string; userID?: number }) => Promise<UserEntity>;
  updateUser: (userID: number, updateCondition: Partial<UserEntity>) => Promise<Partial<UserEntity>>;
  secession: (userID: number, nickname: string) => Promise<Pick<UserEntity, 'id' | 'nickname'>>;
}

export interface IUserRepository {
  insertUser: (email: string, nickname: string, profileImage: string) => Promise<InsertUser>;
  getUserByID: (id: number) => Promise<UserEntity>;
  getUserByNickname: (nickname: string) => Promise<UserEntity>;
  getUserByEmail: (email: string) => Promise<UserEntity>;
  updateUser: (userID: number, updateCondition: Partial<UserEntity>) => Promise<Partial<UserEntity>>;
  deleteUser: (userID: number) => Promise<>;
}
