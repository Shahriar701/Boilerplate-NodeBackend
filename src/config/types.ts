// Define symbols for dependency injection
export const TYPES = {
  // Config
  IEnvironmentConfig: Symbol.for('IEnvironmentConfig'),
  AuthConfig: Symbol.for('AuthConfig'),

  // Database
  IDatabaseConnection: Symbol.for('IDatabaseConnection'),
  IBaseRepository: Symbol.for('IBaseRepository'),

  // Services
  IBaseService: Symbol.for('IBaseService'),
  // Repositories (add as needed)
  IUserRepository: Symbol.for('IUserRepository'),
  IProductRepository: Symbol.for('IProductRepository'),

  // Services (add as needed)
  IUserService: Symbol.for('IUserService'),
  IAuthService: Symbol.for('IAuthService'),
  IProductService: Symbol.for('IProductService'),


  // WebSocket
  SocketService: Symbol.for('SocketService'),
};
