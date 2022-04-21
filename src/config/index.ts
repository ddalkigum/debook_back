import dotenv from 'dotenv';

const PRODUCTION = 'production';
const DEVELOPMENT = 'development';
const LOCAL = 'local';
const TEST = 'test';

const { NODE_ENV } = process.env;

const getPath = (environment: string) => {
  switch (environment) {
    case PRODUCTION:
      return '.env';
    case DEVELOPMENT:
      return '.env.dev';
    case LOCAL:
      return '.env.local';
    case TEST:
      return '.env.local';
    default:
      throw new Error('Environment is incorrect defined');
  }
};

const envPath = getPath(NODE_ENV);
const envFound = dotenv.config({ path: envPath });

if (!envFound || envFound.error) {
  throw new Error(`Couldn.t find ${envPath} file`);
}

import serverConfig from './server';
import dbConfig from './db';
import authConfig from './auth';

export { serverConfig, dbConfig, authConfig };
