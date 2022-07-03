import * as config from './config';
config;
import { container } from './container';
import { IMariaDB } from './infrastructure/database/maria/interface';
import { IServer } from './infrastructure/express/interface';
import { IWinstonLogger } from './infrastructure/logger/interface';
import { TYPES } from './type';

const logger = container.get<IWinstonLogger>(TYPES.WinstonLogger);

const server: IServer = container.get(TYPES.Server);
const mariaDB: IMariaDB = container.get(TYPES.MariaDB);

const start = async () => {
  logger.info(Object.keys(config).map((key) => console.log(key, ': ', config[key])));
  await mariaDB.init();

  server.set();
  server.start(config.serverConfig.port);
};

start();

process.once('SIGTERM', server.exit).once('SIGINT', server.exit);
