# TypeScript Backend Boilerplate

A modern, robust TypeScript backend boilerplate built with SOLID principles, Dependency Injection, and database abstraction to support both SQL and NoSQL databases seamlessly.

## Overview

This boilerplate implements industry best practices for backend development:

- **TypeScript** with strict type checking
- **SOLID Principles** for maintainable code architecture
- **Dependency Injection** using InversifyJS
- **Repository Pattern** for data access abstraction
- **Service Layer** for business logic encapsulation
- **Database Abstraction** supporting both SQL (PostgreSQL) and NoSQL (MongoDB)
- **Unit Testing** with Jest
- **REST API** using Express

## Architecture

The architecture follows a clean, layered approach:

1. **Controllers Layer**: Handles HTTP requests/responses, input validation, and routing
2. **Services Layer**: Implements business logic and orchestrates operations
3. **Repositories Layer**: Abstracts data access operations
4. **Data Access Layer**: Provides database-specific implementations
5. **Models Layer**: Defines domain entities and DTOs

### Dependency Injection

The application uses InversifyJS for dependency injection, which enables:

- Loose coupling between components
- Easier testing through dependency mocking
- Better separation of concerns
- Runtime dependency resolution

### Database Abstraction

One of the key features of this boilerplate is its database agnosticism:

- SQL support using TypeORM (PostgreSQL)
- NoSQL support using Mongoose (MongoDB)
- Repository pattern to abstract data access
- Easy switching between databases via configuration

## Project Structure

```
src/
├── config/          # Configuration files
│   ├── env.config.ts        # Environment variables
│   ├── inversify.config.ts  # DI container setup
│   └── types.ts             # DI types/symbols
├── controllers/     # Express route controllers
│   └── user.controller.ts   # User endpoints
├── database/        # Database connections
│   ├── database.interface.ts  # DB connection interface
│   ├── database.factory.ts    # Factory for DB connections
│   ├── postgres.connection.ts # PostgreSQL implementation
│   └── mongodb.connection.ts  # MongoDB implementation
├── middlewares/     # Express middlewares
├── models/          # Data models
│   ├── dto/              # Data Transfer Objects
│   │   └── user.dto.ts   # User DTOs
│   ├── mongo/            # MongoDB schemas
│   │   └── user.model.ts # User MongoDB model
│   └── sql/              # SQL entities
│       └── user.entity.ts # User TypeORM entity
├── repositories/    # Data access layer
│   ├── base.repository.interface.ts  # Base repository interface
│   ├── mongo/                        # MongoDB repositories
│   │   ├── base.repository.ts        # Base MongoDB repository
│   │   └── user.repository.ts        # User MongoDB repository
│   └── sql/                          # SQL repositories
│       ├── base.repository.ts        # Base SQL repository
│       └── user.repository.ts        # User SQL repository
├── services/        # Business logic layer
│   ├── base.service.interface.ts     # Base service interface
│   ├── base.service.ts               # Base service implementation
│   ├── user.service.ts               # User service
│   └── user.service.test.ts          # User service tests
├── tests/           # Test setup and utilities
└── index.ts         # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- MongoDB or PostgreSQL (depending on your configuration)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/backend-boilerplate.git
   cd Boilerplate-NodeBackend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file to match your database configuration:

   ```
   # Server Configuration
   NODE_ENV=development
   PORT=3000
   API_PREFIX=/api

   # Database Configuration - Choose ONE set
   
   # For SQL (PostgreSQL)
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=app_db

   # For MongoDB
   # DB_TYPE=mongodb  # Uncomment this line to use MongoDB
   MONGO_URI=mongodb://localhost:27017/app_db
   ```

4. Start development server:
   ```
   npm run dev
   ```

5. Run tests:
   ```
   npm test
   ```

### Available Scripts

- `npm run build` - Compiles TypeScript to JavaScript
- `npm run start` - Runs the compiled JavaScript in production
- `npm run dev` - Runs the application in development mode with hot-reload
- `npm run lint` - Runs ESLint to check code quality
- `npm run lint:fix` - Automatically fixes ESLint issues when possible
- `npm test` - Runs Jest tests
- `npm run test:watch` - Runs Jest in watch mode
- `npm run test:coverage` - Generates test coverage report

## How It Works

### Configuration & Bootstrapping

1. The application loads environment variables from `.env`
2. The inversify container is configured and dependencies are registered
3. Database connection is established based on the DB_TYPE environment variable
4. Express server is set up with middleware and controllers
5. The server starts listening on the configured port

### API Endpoints

The boilerplate includes a sample User resource with the following endpoints:

- **GET /api/users** - Get all users
- **GET /api/users/:id** - Get user by ID
- **POST /api/users** - Create a new user
- **PUT /api/users/:id** - Update an existing user
- **DELETE /api/users/:id** - Delete a user

### Adding New Features

#### Creating a New Entity

Follow these steps to add a new entity to your application:

1. **Create Models**
   - For SQL: Create an entity in `src/models/sql/`
   - For MongoDB: Create a schema in `src/models/mongo/`
   - Create DTOs in `src/models/dto/`

2. **Create Repository**
   - Implement the repository interface for the new entity
   - Create SQL and/or MongoDB implementations

3. **Create Service**
   - Implement business logic in a service class

4. **Create Controller**
   - Define routes and HTTP handlers for the entity

5. **Register Dependencies**
   - Add types to `src/config/types.ts`
   - Register in the container in `src/config/inversify.config.ts`

6. **Import Controller**
   - Import the controller in `src/index.ts`

#### Example: Adding a Product Entity

1. Create models:
   - `src/models/sql/product.entity.ts`
   - `src/models/mongo/product.model.ts`
   - `src/models/dto/product.dto.ts`

2. Create repositories:
   - `src/repositories/sql/product.repository.ts`
   - `src/repositories/mongo/product.repository.ts`

3. Create service:
   - `src/services/product.service.ts`

4. Create controller:
   - `src/controllers/product.controller.ts`

5. Update `src/config/types.ts`:
   ```typescript
   export const TYPES = {
     // ... existing types
     IProductRepository: Symbol.for('IProductRepository'),
     IProductService: Symbol.for('IProductService'),
   };
   ```

6. Update `src/config/inversify.config.ts` to register new dependencies.

7. Import the controller in `src/index.ts`.

## Testing

The boilerplate comes with Jest configured for testing:

- **Unit tests**: Test individual components in isolation
- **Integration tests**: Test interactions between components

### Running Tests

- Run all tests:
  ```bash
  npm test
  ```

- Run specific test files:
  ```bash
  npm test -- src/services/user.service.test.ts
  ```

- Run tests with a specific pattern:
  ```bash
  npm test -- -t "should return all users"
  ```

- Run integration tests only:
  ```bash
  npm test -- src/tests/integration
  ```

- Run with coverage report:
  ```bash
  npm run test:coverage
  ```

### Testing Strategy

This boilerplate uses a two-tiered testing approach:

1. **Unit Tests**: These focus on testing individual components (like services) in isolation. Dependencies are mocked to ensure we're only testing the unit's behavior. Example: `src/services/user.service.test.ts`

2. **Integration Tests**: These test how components work together. For example, the UserController integration tests verify that the controller correctly interacts with the service layer and properly handles HTTP requests/responses. Example: `src/tests/integration/user.controller.test.ts`

When writing tests:
- For unit tests, focus on business logic and edge cases
- For integration tests, focus on the contract between components
- Use mocks and stubs to isolate the code being tested
- Write tests before implementing features (TDD) when possible

Example test files:
- `src/services/user.service.test.ts` - Tests for UserService
- `src/tests/integration/user.controller.test.ts` - Integration tests for UserController

## Best Practices

This boilerplate follows these best practices:

- **SOLID Principles**:
  - **S**ingle Responsibility: Each class has one responsibility
  - **O**pen/Closed: Entities are open for extension, closed for modification
  - **L**iskov Substitution: Subtypes can be substituted for their base types
  - **I**nterface Segregation: Specific interfaces instead of general ones
  - **D**ependency Inversion: Depend on abstractions, not concrete implementations

- **Repository Pattern**: Abstracts data access from business logic

- **Service Layer**: Encapsulates business logic

- **Dependency Injection**: Manages dependencies and promotes loosely coupled code

- **Error Handling**: Consistent error handling throughout the application

- **Environment Configuration**: Using environment variables for configuration

## Troubleshooting

### Database Connection Issues

- Check that your database is running
- Verify the connection details in your .env file
- Check for any firewall or network issues

### Dependency Errors

- Try running `npm install` with the `--legacy-peer-deps` flag
- Update dependencies to compatible versions

#### Version Compatibility Notes

This boilerplate has specific version dependencies to ensure compatibility:

- **Express**: Using version 4.18.x (not 5.x) to ensure compatibility with inversify-express-utils
- **Inversify**: Using version 6.x to ensure compatibility with inversify-express-utils

If you see errors related to these dependencies, ensure you're using the correct versions:

```bash
# Fix dependency issues
npm uninstall express inversify inversify-express-utils
npm install express@4.18.2 inversify@6.0.3 inversify-express-utils@6.5.0 --save --legacy-peer-deps
```

### TypeScript Compilation Errors

- Run `npm run build` to see detailed errors
- Check for type inconsistencies in your code

## Middleware

The project includes several middleware components to help with common functionality:

### Authentication Middleware

Located in `src/middlewares/auth.middleware.ts`, this middleware provides:

- JWT-based authentication
- Role-based access control
- Token generation helpers

Example usage:

```typescript
// In controller or route handler
import { createAuthMiddleware, hasRoles } from '@middlewares/auth.middleware';

// Apply middleware to a route
router.get('/protected', 
  createAuthMiddleware(container), 
  (req, res) => {
    res.json({ user: req.user });
  }
);

// Role-based access control
router.get('/admin', 
  createAuthMiddleware(container),
  hasRoles(['admin']), 
  (req, res) => {
    res.json({ message: 'Admin access granted' });
  }
);
```

### Validation Middleware

Located in `src/middlewares/validation.middleware.ts`, this middleware provides:

- Request body validation
- Custom validation rules
- Error messaging

Example usage:

```typescript
import { validateBody, Validators } from '@middlewares/validation.middleware';

// Define validation middleware for user creation
const validateUserCreate = validateBody<CreateUserDTO>(
  {
    email: Validators.email,
    name: Validators.string(2, 100),
    password: Validators.string(8, 100)
  },
  {
    email: 'Please provide a valid email address',
    name: 'Name must be between 2 and 100 characters',
    password: 'Password must be at least 8 characters long'
  }
);

// Apply middleware to a route
router.post('/users', validateUserCreate, createUserController);
```

### Error Handling Middleware

Located in `src/middlewares/error.middleware.ts`, this middleware provides:

- Global error handling
- Custom ApiError class for HTTP errors
- Standardized error responses

Example usage:

```typescript
// Throw an error from a controller
if (!user) {
  throw ApiError.notFound('User not found');
}

// Throw a validation error
if (invalidData) {
  throw ApiError.badRequest('Invalid data', { field: 'Error message' });
}
```

## WebSockets with Socket.IO

The project includes Socket.IO integration for real-time applications:

### Socket Service

Located in `src/services/socket.service.ts`, this service provides:

- WebSocket server initialization
- Event management
- Room-based messaging

Example usage:

```typescript
import { SocketService, SocketEvents } from '@services/socket.service';
import { TYPES } from '@config/types';
import { injectable, inject } from 'inversify';

@injectable()
export class NotificationService {
  constructor(@inject(TYPES.SocketService) private socketService: SocketService) {}

  notifyUser(userId: string, message: string): void {
    this.socketService.emitToRoom(
      `user:${userId}`, 
      SocketEvents.NOTIFICATION_CREATED, 
      { message }
    );
  }
}
```

### Socket Authentication

Socket.IO connections can be authenticated using the same JWT tokens as the REST API:

```typescript
// Client-side connection with auth token
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Socket events
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('notification:created', (data) => {
  console.log('New notification:', data);
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});
```

## License

This project is licensed under the ISC License. 