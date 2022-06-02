import CertificationEntity from '../../infrastructure/database/maria/entity/auth/certification';
import TokenEntity from '../../infrastructure/database/maria/entity/auth/token';
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
  user: UserEntity;
}

export interface SigninResult {
  tokenSet: TokenSet;
  user: UserEntity;
}

export interface IAuthService {
  emailSignup: (code: string, email: string, nickname: string) => Promise<SignupResult>;
  emailSignin: (code: string) => Promise<SigninResult>;
  sendEmail: (email: string) => Promise<string>;
  checkSignupRequest: (code: string) => Promise<CheckSignup>;
}

export interface IAuthRepository {
  insertCertification: (
    certificationID: string,
    code: string,
    email: string,
    isSignup: boolean,
    deleteTime: string
  ) => Promise<Partial<CertificationEntity>>;
  getCertificationByEmail: (email: string) => Promise<CertificationEntity>;
  getCertificationByCode: (code: string) => Promise<CertificationEntity>;
  deleteCertificationByCode: (code: string) => Promise<void>;
  updateToken: (userID: number, tokenSet: TokenSet) => Promise<Partial<TokenEntity>>;
  insertToken: (userID: number, tokenID: string, tokenSet: TokenSet) => Promise<Partial<TokenEntity>>;
  getTokenByAccessToken: (accesstoken: string) => Promise<TokenEntity>;
}
