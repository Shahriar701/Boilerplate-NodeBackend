import { injectable, inject } from 'inversify';
import mongoose from 'mongoose';
import { IDatabaseConnection } from './database.interface';
import { IEnvironmentConfig } from '@config/env.config';
import { TYPES } from '@config/types';

@injectable()
export class MongoDBConnection implements IDatabaseConnection {
  private isConnectedFlag = false;

  constructor(
    @inject(TYPES.IEnvironmentConfig) private readonly config: IEnvironmentConfig
  ) {}

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(this.config.mongoUri);
      this.isConnectedFlag = true;
      console.log('MongoDB database connection established successfully');
    } catch (error) {
      console.error('Error connecting to MongoDB database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
      this.isConnectedFlag = false;
      console.log('MongoDB database connection closed');
    }
  }

  public getConnection(): typeof mongoose {
    if (!this.isConnectedFlag) {
      throw new Error('MongoDB database connection not established');
    }
    return mongoose;
  }

  public isConnected(): boolean {
    return this.isConnectedFlag;
  }
} 