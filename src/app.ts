import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import bodyParser from 'body-parser';

/**
 * Creates and configures an Express application
 * @returns Configured Express application
 */
export function createApp(): Express {
    const app = express();

    // Apply middleware
    app.use(cors());
    app.use(helmet());
    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'ok' });
    });

    // TODO: Add routes here

    return app;
} 