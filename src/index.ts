import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from '@config/inversify.config';
import { TYPES } from '@config/types';
import { IEnvironmentConfig } from '@config/env.config';
import { IDatabaseConnection } from '@database/database.interface';
import { createServer } from 'http';
import { SocketService } from './services/socket.service';
import { errorMiddleware } from './middlewares/error.middleware';
import { createSocketAuthMiddleware } from './middlewares/socket.middleware';

// Import controllers
// Note: The controllers need to be imported here so they can register routes via decorators
import './controllers/user.controller';

async function bootstrap(): Promise<void> {
  try {
    // Get configuration
    const config = container.get<IEnvironmentConfig>(TYPES.IEnvironmentConfig);

    // Connect to the database
    const dbConnection = container.get<IDatabaseConnection>(TYPES.IDatabaseConnection);
    await dbConnection.connect();

    // Setup server
    const server = new InversifyExpressServer(container, null, {
      rootPath: config.apiPrefix
    });

    server.setConfig((app) => {
      // General middleware
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use(helmet());
      app.use(cors());
      app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
    });

    // Build express app
    const app = server.build();

    // Add global error handling middleware
    app.use(errorMiddleware);

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const socketService = container.get<SocketService>(TYPES.SocketService);
    socketService.initialize(httpServer);

    // Add Socket.IO authentication middleware if needed
    const io = socketService.getIO();
    if (io) {
      io.use(createSocketAuthMiddleware(container));
    }

    // Start server
    const port = config.port || 3000;
    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port} in ${config.nodeEnv} mode`);
      console.log(`API is available at http://localhost:${port}${config.apiPrefix}`);
      console.log(`WebSocket server initialized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
bootstrap();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing the application');
  try {
    const dbConnection = container.get<IDatabaseConnection>(TYPES.IDatabaseConnection);
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}); 