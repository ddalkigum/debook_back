import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './type';
import { ExpressServer } from './infrastructure/express/express';
import { IServer } from './infrastructure/express/interface';
import { IMorganLogger, IWinstonLogger } from './infrastructure/logger/interface';
import { IMariaDB } from './infrastructure/database/maria/interface';
import MariaDB from './infrastructure/database/maria/mariaDB';
import { IHttpRouter } from './domain/interface';
import { IApiResponse } from './common/interface';
import { ISES } from './infrastructure/aws/ses/interface';
import { IMiddleware } from './middleware/interface';
import * as Logger from './infrastructure/logger';
import * as Auth from './domain/auth';
import * as User from './domain/user';
import * as Party from './domain/party';
import * as Common from './common';
import * as Middleware from './middleware/middleware';
import * as Image from './domain/image';
import * as Notify from './domain/notify';
import SES from './infrastructure/aws/ses/ses';
import S3Client from './infrastructure/aws/s3/s3';
import { IS3Client } from './infrastructure/aws/s3/interface';
import { IAuthRepository, IAuthService } from './domain/auth/interface';
import { IPartyRepository, IPartyService } from './domain/party/interface';
import { IUserRepository, IUserService } from './domain/user/interface';
import { INotifyRepository, INotifyService } from './domain/notify/interface';
import SlackClient from './infrastructure/slack/alaram';
import { ISlackClient } from './infrastructure/slack/interface';

export const container = new Container({ defaultScope: 'Singleton' });

// Infrastructure
container.bind<IServer>(TYPES.Server).to(ExpressServer);
container.bind<IWinstonLogger>(TYPES.WinstonLogger).to(Logger.Winston);
container.bind<IMorganLogger>(TYPES.MorganLogger).to(Logger.Morgan);
container.bind<IMariaDB>(TYPES.MariaDB).to(MariaDB);
container.bind<IS3Client>(TYPES.S3Client).to(S3Client);
container.bind<ISES>(TYPES.SES).to(SES);
container.bind<ISlackClient>(TYPES.SlackClient).to(SlackClient);

// Common
container.bind<IApiResponse>(TYPES.ApiResponse).to(Common.ApiResponse);
container.bind<IMiddleware>(TYPES.Middleware).to(Middleware.default);

// Domain
// Auth
container.bind<IHttpRouter>(TYPES.AuthRouter).to(Auth.Router);
container.bind<IAuthService>(TYPES.AuthService).to(Auth.Service);
container.bind<IAuthRepository>(TYPES.AuthRepository).to(Auth.Repository);

// Party
container.bind<IHttpRouter>(TYPES.PartyRouter).to(Party.Router);
container.bind<IPartyService>(TYPES.PartyService).to(Party.Service);
container.bind<IPartyRepository>(TYPES.Partyrepository).to(Party.Repository);

// User
container.bind<IHttpRouter>(TYPES.UserRouter).to(User.Router);
container.bind<IUserService>(TYPES.UserService).to(User.Service);
container.bind<IUserRepository>(TYPES.UserRepository).to(User.Repository);

// Imgae
container.bind<IHttpRouter>(TYPES.ImageRouter).to(Image.Router);

// Notify
container.bind<IHttpRouter>(TYPES.NotifyRouter).to(Notify.Router);
container.bind<INotifyService>(TYPES.NotifyService).to(Notify.Service);
container.bind<INotifyRepository>(TYPES.NotifyRepository).to(Notify.Repository);
