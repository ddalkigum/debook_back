import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './type';
import { ExpressServer } from './infrastructure/express/express';
import { IServer } from './infrastructure/express/interface';
import { IMorganLogger, IWinstonLogger } from './infrastructure/logger/interface';
import * as Logger from './infrastructure/logger';
import { IMariaDB } from './infrastructure/database/maria/interface';
import MariaDB from './infrastructure/database/maria/mariaDB';

export const container = new Container({ defaultScope: 'Singleton' });

// Infrastructure
container.bind<IServer>(TYPES.Server).to(ExpressServer);
container.bind<IWinstonLogger>(TYPES.WinstonLogger).to(Logger.Winston);
container.bind<IMorganLogger>(TYPES.MorganLogger).to(Logger.Morgan);
container.bind<IMariaDB>(TYPES.MariaDB).to(MariaDB);

// Domain
