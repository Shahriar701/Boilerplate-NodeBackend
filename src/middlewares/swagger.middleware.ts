import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '@config/swagger.config';

/**
 * Configures Swagger UI documentation
 * @param app Express application
 */
export const setupSwagger = (app: Application): void => {
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // API documentation in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('🔖 Swagger documentation available at /api-docs');
}; 