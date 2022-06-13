import { inject, injectable } from 'inversify';
import { Constants } from '../../constants';
import CertificationEntity from '../../infrastructure/database/maria/entity/auth/certification';
import TokenEntity from '../../infrastructure/database/maria/entity/auth/token';
import { IMariaDB } from '../../infrastructure/database/maria/interface';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IAuthRepository, TokenSet } from './interface';

@injectable()
export default class AuthRepository implements IAuthRepository {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.MariaDB) private mariaDB: IMariaDB;

  public insertCertification = async (context: CertificationEntity) => {
    this.logger.debug(`AuthRepository, insertCertification, context: ${context}`);
    return await this.mariaDB.insert<CertificationEntity>(Constants.CERTIFICATION_TABLE, context);
  };

  public getCertificationByEmail = async (email: string) => {
    this.logger.debug(`AuthRepository, getCertificationByCode, email: ${email}`);
    return await this.mariaDB.findByUniqueColumn<CertificationEntity>(Constants.CERTIFICATION_TABLE, { email });
  };

  public getCertificationByCode = async (code: string) => {
    this.logger.debug(`AuthRepository, getCertificationByCode, code: ${code}`);
    return await this.mariaDB.findByUniqueColumn<CertificationEntity>(Constants.CERTIFICATION_TABLE, { code });
  };

  public deleteCertificationByCode = async (code: string) => {
    this.logger.debug(`AuthRepository, deleteCertificationByCode, code: ${code}`);
    return await this.mariaDB.deleteByColumn<CertificationEntity>(Constants.CERTIFICATION_TABLE, { code });
  };

  public updateToken = async (userID: number, tokenSet: TokenSet) => {
    this.logger.debug(`AuthRepository, updateToken, userID: ${userID}, tokenSet: ${JSON.stringify(tokenSet)}`);
    const { accessToken, refreshToken } = tokenSet;
    return await this.mariaDB.updateByColumn<TokenEntity>(
      Constants.TOKEN_TABLE,
      { userID },
      { accessToken, refreshToken }
    );
  };

  public insertToken = async (userID: number, tokenID: string, tokenSet: TokenSet) => {
    this.logger.debug(
      `AuthRepository, insertToken, userID: ${userID}, tokenID: ${tokenID}, tokenSet: ${JSON.stringify(tokenSet)}`
    );
    const { accessToken, refreshToken } = tokenSet;
    return await this.mariaDB.insert<TokenEntity>(Constants.TOKEN_TABLE, {
      id: tokenID,
      userID,
      accessToken,
      refreshToken,
    });
  };
  public getTokenByAccessToken = async (accessToken: string) => {
    this.logger.debug(`AuthRepository, getTokenByAccessToken, accessToken: ${accessToken}`);
    return await this.mariaDB.findByUniqueColumn<TokenEntity>(Constants.TOKEN_TABLE, { accessToken });
  };
}
