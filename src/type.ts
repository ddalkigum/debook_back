export const TYPES = {
  // Infrastructure
  Server: Symbol.for('Server'),
  WinstonLogger: Symbol.for('WinstonLogger'),
  MorganLogger: Symbol.for('MorganLogger'),
  MariaDB: Symbol.for('MariaDB'),
  SES: Symbol.for('SES'),

  // Common
  ApiResponse: Symbol.for('ApiResponse'),

  // Domain
  // Auth
  AuthRouter: Symbol.for('AuthRouter'),
  AuthService: Symbol.for('AuthService'),
  AuthRepository: Symbol.for('AuthRepository'),

  // User
  UserRouter: Symbol.for('UserRouter'),
  UserService: Symbol.for('UserService'),
  UserRepository: Symbol.for('UserRepository'),
};
