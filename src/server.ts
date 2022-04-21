import * as config from './config';
config;
import { container } from './container';
import { IServer } from './infrastructure/express/interface';
import { TYPES } from './type';

const start = async () => {
  const server: IServer = container.get(TYPES.Server);

  server.set();
  server.start(config.serverConfig.port);
};

start();
