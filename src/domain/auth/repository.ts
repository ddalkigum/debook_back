import { inject, injectable } from 'inversify';
import { Constants } from '../../constants';
import TokenEntity from '../../infrastructure/database/maria/entity/auth/token';
import { IMariaDB } from '../../infrastructure/database/maria/interface';
import { IRedisDB } from '../../infrastructure/database/redis/interface';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IAuthRepository } from './interface';

@injectable()
export default class AuthRepository implements IAuthRepository {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.RedisDB) private redis: IRedisDB;
  @inject(TYPES.MariaDB) private mariaDB: IMariaDB;

  // Set RedisDB
  public insertAuthCode = async (email: string, code: string) => {
    this.logger.debug(`AuthRepository, setAuthCode, email: ${email}, code: ${code}`);
    const hour = 60 * 60;
    return await this.redis.insert(code, email, { expireTime: hour });
  };

  public getEmail = async (code: string) => {
    this.logger.debug(`AuthRepository, getEmail, code: ${code}`);
    return await this.redis.find(code);
  };

  public deleteAuthCode = async (code: string) => {
    this.logger.debug(`AuthRepository, deleteAuthCode, code: ${code}`);
    return await this.redis.remove(code);
  };

  // Set MariaDB
  public insertToken = async (tokenID: string, accessToken: string, refreshToken: string) => {
    this.logger.debug(
      `AuthRepository, insertToken, tokenID: ${tokenID}, accessToken: ${accessToken}, refreshToken: ${refreshToken}`
    );
    return await this.mariaDB.insert<TokenEntity>(Constants.TOKEN_TABLE, { id: tokenID, accessToken, refreshToken });
  };
}
