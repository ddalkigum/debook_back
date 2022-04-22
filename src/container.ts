import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './type';
import { ExpressServer } from './infrastructure/express/express';
import { IServer } from './infrastructure/express/interface';
import { IMorganLogger, IWinstonLogger } from './infrastructure/logger/interface';
import { IMariaDB } from './infrastructure/database/maria/interface';
import MariaDB from './infrastructure/database/maria/mariaDB';
import { IRedisDB } from './infrastructure/database/redis/interface';
import RedisDB from './infrastructure/database/redis/redisDB';
import { IAuthRepository, IAuthService } from './domain/auth/interface';
import { IHttpRouter } from './domain/interface';
import * as Logger from './infrastructure/logger';
import * as Auth from './domain/auth';

export const container = new Container({ defaultScope: 'Singleton' });

// Infrastructure
container.bind<IServer>(TYPES.Server).to(ExpressServer);
container.bind<IWinstonLogger>(TYPES.WinstonLogger).to(Logger.Winston);
container.bind<IMorganLogger>(TYPES.MorganLogger).to(Logger.Morgan);
container.bind<IMariaDB>(TYPES.MariaDB).to(MariaDB);
container.bind<IRedisDB>(TYPES.RedisDB).to(RedisDB);

// Domain
container.bind<IAuthRepository>(TYPES.AuthRepository).to(Auth.Repository);
container.bind<IAuthService>(TYPES.AuthService).to(Auth.Service);
container.bind<IHttpRouter>(TYPES.AuthRouter).to(Auth.Router);
