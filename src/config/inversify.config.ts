import { Container } from 'inversify';
import { EnvironmentConfig, IEnvironmentConfig } from './env.config';
import { TYPES } from './types';
import { IDatabaseConnection } from '@database/database.interface';
import { DatabaseFactory } from '@database/database.factory';
import { IUserService } from '../interfaces/user.service.interfaces';
import { UserService } from '@services/user.service';
import { IUserRepository } from '@repositories/mongo/user.repository';
import { SocketService } from '@services/socket.service';
import { AuthConfig } from '../middlewares/auth.middleware';

// Import repositories based on database type
const dbType = process.env.DB_TYPE || 'postgres';
let UserRepositoryClass;

if (dbType.toLowerCase() === 'mongodb' || dbType.toLowerCase() === 'mongo') {
  const { UserRepository } = require('@repositories/mongo/user.repository');
  UserRepositoryClass = UserRepository;
} else {
  const { UserRepository } = require('@repositories/sql/user.repository');
  UserRepositoryClass = UserRepository;
}

// Create and configure the DI container
const container = new Container();

// Bind configuration
container.bind<IEnvironmentConfig>(TYPES.IEnvironmentConfig).to(EnvironmentConfig).inSingletonScope();

// Bind auth configuration
container.bind<AuthConfig>(TYPES.AuthConfig).toDynamicValue((context) => {
  const envConfig = context.container.get<IEnvironmentConfig>(TYPES.IEnvironmentConfig);
  return {
    secret: envConfig.jwtSecret,
    tokenExpiration: envConfig.jwtExpiresIn
  };
}).inSingletonScope();

// Bind database
container.bind<DatabaseFactory>(DatabaseFactory).toSelf();
container.bind<IDatabaseConnection>(TYPES.IDatabaseConnection).toDynamicValue((context) => {
  // Get the database factory from the container
  const factory = container.get<DatabaseFactory>(DatabaseFactory);
  return factory.createConnection();
}).inSingletonScope();

// Bind repositories
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepositoryClass).inSingletonScope();

// Bind services
container.bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope();

// Bind WebSocket services
container.bind<SocketService>(TYPES.SocketService).to(SocketService).inSingletonScope();

// You would bind your services, repositories, etc. here
// Example:
// container.bind<IUserService>(TYPES.IUserService).to(UserService);
// container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository);

export { container }; 