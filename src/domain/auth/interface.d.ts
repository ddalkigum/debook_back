import CertificationEntity from '../../infrastructure/database/maria/entity/auth/certification';
import TokenEntity from '../../infrastructure/database/maria/entity/auth/token';
import { DateTimeEntity } from '../../infrastructure/database/maria/entity/datetime';
import UserEntity from '../../infrastructure/database/maria/entity/user/user';

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
}

export interface CheckSignup {
  isSignup: boolean;
}

export interface SignupResult {
  tokenSet: TokenSet;
  user: Omit<UserEntity, keyof DateTimeEntity>;
}

export interface SigninResult {
  tokenSet: TokenSet;
  user: UserEntity;
}

export interface IAuthService {
  emailSignup: (code: string, email: string, nickname: string) => Promise<SignupResult>;
  emailSignin: (code: string) => Promise<SigninResult>;
  generateRedirectURL: (provider: string) => string;
  googleSignin: (code: string) => Promise<any>;
  sendEmail: (email: string) => Promise<string>;
  checkSignupRequest: (code: string) => Promise<CheckSignup>;
}

export interface IAuthRepository {
  insertCertification: (context: CertificationEntity) => Promise<CertificationEntity>;
  getCertificationByEmail: (email: string) => Promise<CertificationEntity>;
  getCertificationByCode: (code: string) => Promise<CertificationEntity>;
  deleteCertificationByCode: (code: string) => Promise<void>;
  updateToken: (userID: number, updateCondition: Partial<TokenEntity>) => Promise<Partial<TokenEntity>>;
  insertToken: (userID: number, tokenID: string, tokenSet: TokenSet) => Promise<Partial<TokenEntity>>;
  getTokenByID: (id: string) => Promise<TokenEntity>;
  getTokenByUserID: (userID: number) => Promise<TokenEntity>;
  deleteToken: (userID: number) => Promise<any>;
}
