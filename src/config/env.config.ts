import { config } from 'dotenv';
import { injectable } from 'inversify';

// Load environment variables from .env file
config();

export interface IEnvironmentConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  dbType: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbName: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

@injectable()
export class EnvironmentConfig implements IEnvironmentConfig {
  public nodeEnv: string = process.env.NODE_ENV || 'development';
  public port: number = parseInt(process.env.PORT || '3000', 10);
  public apiPrefix: string = process.env.API_PREFIX || '/api';
  
  // SQL DB config
  public dbType: string = process.env.DB_TYPE || 'postgres';
  public dbHost: string = process.env.DB_HOST || 'localhost';
  public dbPort: number = parseInt(process.env.DB_PORT || '5432', 10);
  public dbUsername: string = process.env.DB_USERNAME || 'postgres';
  public dbPassword: string = process.env.DB_PASSWORD || 'postgres';
  public dbName: string = process.env.DB_NAME || 'app_db';
  
  // MongoDB config
  public mongoUri: string = process.env.MONGO_URI || 'mongodb://localhost:27017/app_db';
  
  // JWT config
  public jwtSecret: string = process.env.JWT_SECRET || 'dev_secret';
  public jwtExpiresIn: string = process.env.JWT_EXPIRES_IN || '1d';
} 