import { inject, injectable } from 'inversify';
import { createClient, RedisClientType } from 'redis';
import { TYPES } from '../../../type';
import { IWinstonLogger } from '../../logger/interface';
import { IRedisDB, RedisOptions } from './interface';
import * as config from '../../../config';

@injectable()
export default class RedisDB implements IRedisDB {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;

  private client?: RedisClientType;

  public init = async () => {
    this.logger.info('RedisDB connecting...');
    const { username, password, host, port } = config.redisConfig;
    const connectURL = `redis://${username}:${password}@${host}:${port}`;
    const localConnectURL = `redis://localhost:6379`;

    this.client = createClient({
      url: process.env.NODE_ENV === 'production' ? connectURL : localConnectURL,
    });
    await this.client.connect();
    this.logger.info('RedisDB connect!');
  };

  public close = async () => {
    await this.client.quit();
  };

  public insert = async (key: string, value: string, options: RedisOptions) => {
    this.logger.debug(`RedisDB, insert, key: ${key}, value: ${value}`);
    await this.client.set(key, value, { EX: options.expireTime });
  };

  public find = async (key: string) => {
    this.logger.debug(`RedisDB, find, key: ${key}`);
    const result = await this.client.get(key);

    this.logger.debug(`RedisDB, found, result: ${result}`);
    return result;
  };

  public remove = async (key: string) => {
    this.logger.debug(`RedisDB, remove, key: ${key}`);
    await this.client.del(key);
  };
}
