import { injectable, inject } from 'inversify';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { IDatabaseConnection } from './database.interface';
import { IEnvironmentConfig } from '@config/env.config';
import { TYPES } from '@config/types';

@injectable()
export class DynamoDBConnection implements IDatabaseConnection {
    private client: DynamoDBClient | null = null;
    private docClient: DynamoDBDocumentClient | null = null;
    private isConnectedFlag = false;

    constructor(
        @inject(TYPES.IEnvironmentConfig) private readonly config: IEnvironmentConfig
    ) { }

    public async connect(): Promise<void> {
        try {
            const options: any = {
                region: this.config.dynamoRegion,
            };

            // Use custom endpoint for local development with DynamoDB Local
            if (this.config.dynamoEndpoint) {
                options.endpoint = this.config.dynamoEndpoint;
            }

            this.client = new DynamoDBClient(options);
            this.docClient = DynamoDBDocumentClient.from(this.client);

            this.isConnectedFlag = true;
            console.log('DynamoDB connection established successfully');
        } catch (error) {
            console.error('Error connecting to DynamoDB:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.destroy();
            this.isConnectedFlag = false;
            console.log('DynamoDB connection closed');
        }
    }

    public getConnection(): DynamoDBDocumentClient {
        if (!this.docClient) {
            throw new Error('DynamoDB connection not established');
        }
        return this.docClient;
    }

    public isConnected(): boolean {
        return this.isConnectedFlag;
    }
} 