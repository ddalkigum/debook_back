const DEFAULT_PORT = '3000';

const serverConfig = {
  port: process.env.PORT || DEFAULT_PORT,
  baseURL: 'http://localhost',
};

export default serverConfig;
