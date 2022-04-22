import TokenEntity from '../../infrastructure/database/maria/entity/auth/token';

export interface IAuthService {
  setAuthCode: (email: string) => Promise<string>;
  getEmailOnRedis: (code: string) => Promise<>;
  sendEmail: (email: string, code: string) => Promise<void>;
  setToken: (userID: number) => Promise<TokenEntity>;
}

export interface IAuthRepository {
  insertAuthCode: (email: string, code: string) => Promise<void>;
  getEmail: (code: string) => Promise<string>;
  deleteAuthCode: (code: string) => Promise<void>;
  insertToken: (tokenID: strinb, accessToken: string, refreshToken: string) => Promise<TokenEntity>;
}
