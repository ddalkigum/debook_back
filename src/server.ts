import * as config from './config';
config;
import { container } from './container';
import { IMariaDB } from './infrastructure/database/maria/interface';
import { IServer } from './infrastructure/express/interface';
import { TYPES } from './type';

const server: IServer = container.get(TYPES.Server);
const mariaDB: IMariaDB = container.get(TYPES.MariaDB);

const start = async () => {
  console.log('config: ', config);
  await mariaDB.init();

  server.set();
  server.start(config.serverConfig.port);
};

start();

process.once('SIGTERM', server.exit).once('SIGINT', server.exit);
