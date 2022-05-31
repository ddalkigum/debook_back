const DEFAULT_PORT = '3001';

const serverConfig = {
  port: process.env.PORT || DEFAULT_PORT,
  baseURL: process.env.BASE_URL,
};

export default serverConfig;
