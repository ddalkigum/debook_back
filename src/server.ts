import * as config from './config';
config;
import { container } from './container';
import { IMariaDB } from './infrastructure/database/maria/interface';
import { IRedisDB } from './infrastructure/database/redis/interface';
import { IServer } from './infrastructure/express/interface';
import { TYPES } from './type';

const start = async () => {
  const server: IServer = container.get(TYPES.Server);
  const mariaDB: IMariaDB = container.get(TYPES.MariaDB);
  const redisDB: IRedisDB = container.get(TYPES.RedisDB);

  console.log('config: ', config);

  await mariaDB.init();
  await redisDB.init();

  server.set();
  server.start(config.serverConfig.port);
};

start();
