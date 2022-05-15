import CertificationEntity from '../../infrastructure/database/maria/entity/auth/certification';
import TokenEntity from '../../infrastructure/database/maria/entity/auth/token';

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
}

export interface CheckSignup {
  isSignup: boolean;
}

export interface IAuthService {
  emailSignup: (code: string, email: string, nickname: string) => Promise<TokenSet>;
  emailSignin: (code: string) => Promise<TokenSet>;
  sendEmail: (email: string) => Promise<void>;
  checkSignupRequest: (code: string) => Promise<CheckSignup>;
}

export interface IAuthRepository {
  insertCertification: (code: string, email: string, isSignup: boolean) => Promise<Partial<CertificationEntity>>;
  getCertificationByCode: (code: string) => Promise<CertificationEntity>;
  deleteCertificationByCode: (code: string) => Promise<void>;
  updateToken: (userID: number, tokenSet: TokenSet) => Promise<Partial<TokenEntity>>;
  insertToken: (userID: number, tokenID: string, tokenSet: TokenSet) => Promise<Partial<TokenEntity>>;
  getTokenByAccessToken: (accesstoken: string) => Promise<TokenEntity>;
}
