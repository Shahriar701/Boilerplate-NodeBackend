import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { createApp } from './app';
import { container } from '@config/inversify.config';
import { TYPES } from '@config/types';
import { IDatabaseConnection } from '@database/database.interface';

// Create the Express app
const app = createApp();

// Initialize the database connection
let isDbConnected = false;

// Handler function for AWS Lambda
export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
): Promise<APIGatewayProxyResult> => {
    // Initialize database connection if not already connected
    if (!isDbConnected) {
        try {
            const dbConnection = container.get<IDatabaseConnection>(TYPES.IDatabaseConnection);
            await dbConnection.connect();
            isDbConnected = true;
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Failed to connect to database:', error);
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Internal Server Error: Database connection failed',
                }),
            };
        }
    }

    // Set up serverless-express with custom options
    const serverlessHandler = serverlessExpress({ app });

    // Call the serverless express handler
    return serverlessHandler(event, context, callback);
}; 