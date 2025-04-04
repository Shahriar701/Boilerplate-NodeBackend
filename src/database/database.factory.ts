import { injectable, inject } from 'inversify';
import { IDatabaseConnection } from './database.interface';
import { PostgresConnection } from './postgres.connection';
import { MongoDBConnection } from './mongodb.connection';
import { IEnvironmentConfig } from '@config/env.config';
import { TYPES } from '@config/types';

@injectable()
export class DatabaseFactory {
  constructor(
    @inject(TYPES.IEnvironmentConfig) private readonly config: IEnvironmentConfig
  ) {}

  public createConnection(): IDatabaseConnection {
    switch (this.config.dbType.toLowerCase()) {
      case 'postgres':
      case 'postgresql':
        return new PostgresConnection(this.config);
      case 'mongodb':
      case 'mongo':
        return new MongoDBConnection(this.config);
      default:
        throw new Error(`Unsupported database type: ${this.config.dbType}`);
    }
  }
} 