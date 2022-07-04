export const TYPES = {
  // Infrastructure
  Server: Symbol.for('Server'),
  WinstonLogger: Symbol.for('WinstonLogger'),
  MorganLogger: Symbol.for('MorganLogger'),
  MariaDB: Symbol.for('MariaDB'),
  SES: Symbol.for('SES'),
  S3Client: Symbol.for('S3Client'),
  SlackClient: Symbol.for('SlackClient'),

  // Common
  ApiResponse: Symbol.for('ApiResponse'),
  Middleware: Symbol.for('Middleware'),

  // Domain
  // Auth
  AuthRouter: Symbol.for('AuthRouter'),
  AuthService: Symbol.for('AuthService'),
  AuthRepository: Symbol.for('AuthRepository'),

  // Party
  PartyRouter: Symbol.for('PartyRouter'),
  PartyService: Symbol.for('PartyService'),
  Partyrepository: Symbol.for('Partyrepository'),

  // User
  UserRouter: Symbol.for('UserRouter'),
  UserService: Symbol.for('UserService'),
  UserRepository: Symbol.for('UserRepository'),

  // Image
  ImageRouter: Symbol.for('ImageRouter'),
};
