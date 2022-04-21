import dotenv from 'dotenv';
import serverConfig from './server';

const PRODUCTION = 'production';
const DEVELOPMENT = 'development';
const LOCAL = 'local';
const TEST = 'local';

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
      return '.env.test';
    default:
      throw new Error('Environment is incorrect defined');
  }
};

const envPath = getPath(NODE_ENV);
const envFound = dotenv.config({ path: envPath });

if (!envFound || envFound.error) {
  throw new Error(`Couldn.t find ${envPath} file`);
}

export { serverConfig };
