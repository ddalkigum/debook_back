import { Constants } from '../../constants';
import CertificationEntity from '../../infrastructure/database/maria/entity/auth/certification';
import TokenEntity from '../../infrastructure/database/maria/entity/auth/token';
import UserEntity from '../../infrastructure/database/maria/entity/user/user';

// @FIXME: 이름 마음에 안드는데
type ISignup = Omit<UserEntity, 'id'> & Omit<TokenEntity, 'id'>;

export interface IAuthService {
  setCertification: (email: string, code: string) => Promise<Constants>;
  sendEmail: (status: Constants, email: string, code: string) => Promise<void>;
  getCertification: (code: string) => Promise<CertificationEntity>;
  signup: (code: string, email: string, nickname: string) => Promise<ISignup>;
  signin: (code: string, email: string) => Promise<ISignup>;
}

export interface IAuthRepository {
  insertCertification: (code: string, email: string) => Promise<any>;
  getCertification: (code: string) => Promise<CertificationEntity>;
  deleteCertification: (code: string) => Promise<void>;
  updateToken: (userID: number, accessToken: string, refreshToken: string) => Promise<>;
}
