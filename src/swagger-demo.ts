import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// Define Swagger options
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Demo API Documentation',
      version: '1.0.0',
      description: 'A simple Express API for testing Swagger',
    },
    servers: [
      {
        url: '/',
        description: 'Local server',
      },
    ],
  },
  apis: ['./src/swagger-demo.ts'], // Path to this file for the JSDoc annotations
};

// Initialize Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Create Express app
const app = express();
const port = 3030;

// Setup Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API documentation in JSON format
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /hello:
 *   get:
 *     summary: Returns a hello message
 *     description: A simple endpoint to test the API
 *     responses:
 *       200:
 *         description: A successful response with a hello message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The hello message
 *               example:
 *                 message: Hello, World!
 */
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns a list of users
 *     description: A simple endpoint to test the API
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The user ID
 *                   name:
 *                     type: string
 *                     description: The user name
 *                   email:
 *                     type: string
 *                     description: The user email
 *               example:
 *                 - id: 1
 *                   name: John Doe
 *                   email: john@example.com
 *                 - id: 2
 *                   name: Jane Smith
 *                   email: jane@example.com
 */
app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
}); 