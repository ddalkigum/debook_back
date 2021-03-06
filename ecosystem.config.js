const env = process.env.NODE_ENV || 'development';

module.exports = {
  apps: [
    {
      name: 'debook',
      script: env === 'production' ? './dist/server.js' : './src/server.ts',
      exec_mode: 'cluster',
      instances: env === 'production' ? '2' : '1',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
      env_local: {
        NODE_ENV: 'local',
      },
    },
  ],
};
