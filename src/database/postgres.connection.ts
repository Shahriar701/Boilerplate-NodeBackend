import { injectable, inject } from 'inversify';
import { DataSource } from 'typeorm';
import { IDatabaseConnection } from './database.interface';
import { IEnvironmentConfig } from '@config/env.config';
import { TYPES } from '@config/types';

@injectable()
export class PostgresConnection implements IDatabaseConnection {
  private connection: DataSource | null = null;
  private isConnectedFlag = false;

  constructor(
    @inject(TYPES.IEnvironmentConfig) private readonly config: IEnvironmentConfig
  ) {}

  public async connect(): Promise<void> {
    try {
      this.connection = new DataSource({
        type: 'postgres',
        host: this.config.dbHost,
        port: this.config.dbPort,
        username: this.config.dbUsername,
        password: this.config.dbPassword,
        database: this.config.dbName,
        entities: [__dirname + '/../models/sql/*.entity{.ts,.js}'],
        synchronize: this.config.nodeEnv === 'development', // Only in dev, use migrations in prod
        logging: this.config.nodeEnv === 'development',
      });

      await this.connection.initialize();
      this.isConnectedFlag = true;
      console.log('PostgreSQL database connection established successfully');
    } catch (error) {
      console.error('Error connecting to PostgreSQL database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.destroy();
      this.isConnectedFlag = false;
      console.log('PostgreSQL database connection closed');
    }
  }

  public getConnection(): DataSource {
    if (!this.connection) {
      throw new Error('PostgreSQL database connection not established');
    }
    return this.connection;
  }

  public isConnected(): boolean {
    return this.isConnectedFlag;
  }
} 