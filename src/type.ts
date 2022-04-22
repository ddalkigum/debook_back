export const TYPES = {
  // Infrastructure
  Server: Symbol.for('Server'),
  WinstonLogger: Symbol.for('WinstonLogger'),
  MorganLogger: Symbol.for('MorganLogger'),
  MariaDB: Symbol.for('MariaDB'),
  RedisDB: Symbol.for('RedisDB'),

  // Domain
  // Auth
  AuthRouter: Symbol.for('AuthRouter'),
  AuthService: Symbol.for('AuthService'),
  AuthRepository: Symbol.for('AuthRepository'),
};
