import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import { TYPES } from '@config/types';
import { IUserService } from '@/interfaces/user.service.interfaces';
import { UserResponseDTO, CreateUserDTO, UpdateUserDTO } from '@/models/dto/user.dto';

// Import controller for route registration
import '@controllers/user.controller';

// Mock auth middleware
jest.mock('@/middlewares/auth.middleware', () => ({
  createAuthMiddleware: () => (req: any, res: any, next: any) => next(),
  hasRoles: () => (req: any, res: any, next: any) => next()
}));

// Create mock functions for user service
const findAllMock = jest.fn();
const findByIdMock = jest.fn();
const findByEmailMock = jest.fn();
const createMock = jest.fn();
const updateMock = jest.fn();
const deleteMock = jest.fn();

// Mock user service
const mockUserService: IUserService = {
  findAll: () => findAllMock(),
  findById: (id: string) => findByIdMock(id),
  findByEmail: (email: string) => findByEmailMock(email),
  create: (data: CreateUserDTO) => createMock(data),
  update: (id: string, data: UpdateUserDTO) => updateMock(id, data),
  delete: (id: string) => deleteMock(id),
};

// Helper function to compare objects ignoring date format differences
const expectObjectsToMatch = (actual: any, expected: any) => {
  const normalizedActual = { ...actual };
  const normalizedExpected = { ...expected };

  // Convert date strings back to Date objects for comparison
  if (normalizedActual.createdAt && typeof normalizedActual.createdAt === 'string') {
    normalizedActual.createdAt = new Date(normalizedActual.createdAt);
  }
  if (normalizedActual.updatedAt && typeof normalizedActual.updatedAt === 'string') {
    normalizedActual.updatedAt = new Date(normalizedActual.updatedAt);
  }

  // Compare the key properties excluding exact date equality
  expect(normalizedActual.id).toEqual(normalizedExpected.id);
  expect(normalizedActual.name).toEqual(normalizedExpected.name);
  expect(normalizedActual.email).toEqual(normalizedExpected.email);
  expect(normalizedActual.isActive).toEqual(normalizedExpected.isActive);

  // Verify dates exist but don't compare exact values
  expect(normalizedActual.createdAt).toBeInstanceOf(Date);
  expect(normalizedActual.updatedAt).toBeInstanceOf(Date);
};

describe('UserController (Integration)', () => {
  let app: express.Application;
  const container = new Container();

  beforeAll(() => {
    // Set up container with mocked services
    container.bind<IUserService>(TYPES.IUserService).toConstantValue(mockUserService);
    
    // Mock the environment config used by auth middleware
    container.bind<any>(TYPES.IEnvironmentConfig).toConstantValue({
      jwtSecret: 'test-secret'
    });

    // Create server
    const server = new InversifyExpressServer(container);
    server.setConfig((app) => {
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      
      // Add container to each request to support auth middleware
      app.use((req: any, _res, next) => {
        req.container = container;
        // Mock user for selfOrAdmin middleware
        req.user = { 
          id: req.params.id || '1',
          roles: ['admin']
        };
        next();
      });
    });

    app = server.build();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com', isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'User 2', email: 'user2@example.com', isActive: false, createdAt: new Date(), updatedAt: new Date() },
      ];

      findAllMock.mockResolvedValue(mockUsers);

      const response = await request(app).get('/users');

      expect(response.status).toBe(200);

      // Check array length
      expect(response.body.length).toEqual(mockUsers.length);

      // Check each user object
      response.body.forEach((user: any, index: number) => {
        expect(user.id).toEqual(mockUsers[index].id);
        expect(user.name).toEqual(mockUsers[index].name);
        expect(user.email).toEqual(mockUsers[index].email);
        expect(user.isActive).toEqual(mockUsers[index].isActive);
        // Don't compare exact date values, just check they exist
        expect(user.createdAt).toBeTruthy();
        expect(user.updatedAt).toBeTruthy();
      });

      expect(findAllMock).toHaveBeenCalled();
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      findByIdMock.mockResolvedValue(mockUser);

      const response = await request(app).get('/users/1');

      expect(response.status).toBe(200);
      expectObjectsToMatch(response.body, mockUser);
      expect(findByIdMock).toHaveBeenCalledWith('1');
    });

    it('should return 404 if user not found', async () => {
      findByIdMock.mockResolvedValue(null);

      const response = await request(app).get('/users/999');

      expect(response.status).toBe(404);
      expect(findByIdMock).toHaveBeenCalledWith('999');
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const createdUser = {
        id: '3',
        name: 'New User',
        email: 'newuser@example.com',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      createMock.mockResolvedValue(createdUser);

      const response = await request(app)
        .post('/users')
        .send(newUserData);

      expect(response.status).toBe(201);
      expectObjectsToMatch(response.body, createdUser);
      expect(createMock).toHaveBeenCalledWith(newUserData);
    });
  });
}); 