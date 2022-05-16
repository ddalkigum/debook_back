import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './type';
import { ExpressServer } from './infrastructure/express/express';
import { IServer } from './infrastructure/express/interface';
import { IMorganLogger, IWinstonLogger } from './infrastructure/logger/interface';
import { IMariaDB } from './infrastructure/database/maria/interface';
import MariaDB from './infrastructure/database/maria/mariaDB';
import { IHttpRouter } from './domain/interface';
import { IUserRepository, IUserService } from './domain/user/interface';
import { IApiResponse } from './common/interface';
import * as Logger from './infrastructure/logger';
import * as Auth from './domain/auth';
import * as User from './domain/user';
import * as Common from './common';
import { IAuthRepository, IAuthService } from './domain/auth/interface';
import SES from './infrastructure/aws/ses/ses';
import { ISES } from './infrastructure/aws/ses/interface';

export const container = new Container({ defaultScope: 'Singleton' });

// Infrastructure
container.bind<IServer>(TYPES.Server).to(ExpressServer);
container.bind<IWinstonLogger>(TYPES.WinstonLogger).to(Logger.Winston);
container.bind<IMorganLogger>(TYPES.MorganLogger).to(Logger.Morgan);
container.bind<IMariaDB>(TYPES.MariaDB).to(MariaDB);
container.bind<ISES>(TYPES.SES).to(SES);

// Common
container.bind<IApiResponse>(TYPES.ApiResponse).to(Common.ApiResponse);

// Domain
// Auth
container.bind<IHttpRouter>(TYPES.AuthRouter).to(Auth.Router);
container.bind<IAuthService>(TYPES.AuthService).to(Auth.Service);
container.bind<IAuthRepository>(TYPES.AuthRepository).to(Auth.Repository);

// User
container.bind<IHttpRouter>(TYPES.UserRouter).to(User.Router);
container.bind<IUserService>(TYPES.UserService).to(User.Service);
container.bind<IUserRepository>(TYPES.UserRepository).to(User.Repository);
