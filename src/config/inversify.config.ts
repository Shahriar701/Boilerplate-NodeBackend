import { Container } from 'inversify';
import { EnvironmentConfig, IEnvironmentConfig } from './env.config';
import { TYPES } from './types';
import { IDatabaseConnection } from '@database/database.interface';
import { DatabaseFactory } from '@database/database.factory';
import { UserService } from '@/services/user.service';
import { IUserRepository } from '@repositories/mongo/user.repository';
import { SocketService } from '@services/socket.service';
import { AuthConfig } from '../middlewares/auth.middleware';
import { IUserService } from '@/interfaces/user.service.interfaces';
import { IProductRepository } from '@/repositories/mongo/product.repository';
import { IProductService } from '@/interfaces/product.service.interface';
import { ProductService } from '@/services/product.service';
import { AuthService } from '@services/auth.service';
import { IAuthService } from '@/interfaces/auth.service.interfaces';
import { IProductRepository as DynamoProductRepositoryInterface } from '@/repositories/dynamodb/product.repository';
import { ProductRepository as DynamoProductRepository } from '@/repositories/dynamodb/product.repository';
import { IProductDataAdapter, MongoProductAdapter, DynamoProductAdapter } from '@/interfaces/adapters/product.adapter.interface';

// Import repositories based on database type
const dbType = process.env.DB_TYPE || 'postgres';
let UserRepositoryClass;
let ProductRepositoryClass;

if (dbType.toLowerCase() === 'mongodb' || dbType.toLowerCase() === 'mongo') {
  const { UserRepository } = require('@repositories/mongo/user.repository');
  const { ProductRepository } = require('@repositories/mongo/product.repository');

  UserRepositoryClass = UserRepository;
  ProductRepositoryClass = ProductRepository;
} else if (dbType.toLowerCase() === 'dynamodb' || dbType.toLowerCase() === 'dynamo') {
  const { UserRepository } = require('@repositories/dynamodb/user.repository');
  const { ProductRepository } = require('@repositories/dynamodb/product.repository');

  UserRepositoryClass = UserRepository;
  ProductRepositoryClass = ProductRepository;
} else {
  const { UserRepository } = require('@repositories/sql/user.repository');
  // Default to a SQL product repository if available, or null otherwise
  try {
    const { ProductRepository } = require('@repositories/sql/product.repository');
    ProductRepositoryClass = ProductRepository;
  } catch (error) {
    console.warn('SQL Product repository not found, product functionality may be limited');
    ProductRepositoryClass = null;
  }
  
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
container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepositoryClass);
if (ProductRepositoryClass) {
  container.bind<IProductRepository>(TYPES.IProductRepository).to(ProductRepositoryClass);
}

// Bind the appropriate data adapter based on database type
if (dbType.toLowerCase() === 'dynamodb' || dbType.toLowerCase() === 'dynamo') {
  container.bind<IProductDataAdapter>(TYPES.IProductDataAdapter).to(DynamoProductAdapter);
} else {
  container.bind<IProductDataAdapter>(TYPES.IProductDataAdapter).to(MongoProductAdapter);
}

// Bind services
container.bind<IUserService>(TYPES.IUserService).to(UserService);
container.bind<IAuthService>(TYPES.IAuthService).to(AuthService);
container.bind<IProductService>(TYPES.IProductService).to(ProductService);

// Bind socket service
container.bind<SocketService>(TYPES.SocketService).to(SocketService);

export { container }; 