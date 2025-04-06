import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import jwt from 'jsonwebtoken';
import { TYPES } from '@config/types';
import { IUserService } from '@/interfaces/user.service.interfaces';
import { IProductService } from '@/interfaces/product.service.interfaces';

// Import controllers for route registration
import '@controllers/user.controller';
import '@controllers/product.controller';

// Mock services
const mockUserService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

const mockProductService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByType: jest.fn(),
    findByPriceRange: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

// Mock config for auth
const mockConfig = {
    jwtSecret: 'test-secret',
    jwtExpiresIn: '1h',
    nodeEnv: 'test',
};

describe('Authentication Middleware Tests', () => {
    let app: express.Application;
    let container: Container;

    // Pre-generate tokens for tests to avoid TypeScript issues with jwt.sign
    const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTYxNjc2MzIwMH0.dMGIAFp9nOWTCMbdkWlYnZn0qIRYW-_lOAUVBQfH1Gg';
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluMTIzIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTYxNjc2MzIwMH0.gMJeRYHFmfMH_S3kTQqFxoL-Mg5pkQzfBH-SxnJGEZI';

    // Setup test app with controllers and mocked services
    beforeAll(() => {
        // Mock jwt.verify to return the expected payload
        jest.spyOn(jwt, 'verify').mockImplementation((token) => {
            if (token === userToken) {
                return { id: 'user123', email: 'user@example.com', roles: ['user'] };
            }
            if (token === adminToken) {
                return { id: 'admin123', email: 'admin@example.com', roles: ['admin'] };
            }
            throw new jwt.JsonWebTokenError('Invalid token');
        });

        container = new Container();

        // Bind mock services
        container.bind<IUserService>(TYPES.IUserService).toConstantValue(mockUserService);
        container.bind<IProductService>(TYPES.IProductService).toConstantValue(mockProductService);
        container.bind(TYPES.IEnvironmentConfig).toConstantValue(mockConfig);

        // Create server
        const server = new InversifyExpressServer(container);

        server.setConfig((app) => {
            app.use(express.json());

            // Attach container to request for auth middleware
            app.use((req, _res, next) => {
                (req as any).container = container;
                next();
            });
        });

        app = server.build();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Public Routes', () => {
        it('should allow access to public product routes without authentication', async () => {
            // Setup mock return values
            mockProductService.findAll.mockResolvedValue([
                { productId: '1', name: 'Test Product', type: 'Test' }
            ]);

            // Test GET /products
            const response = await request(app).get('/products');
            expect(response.status).toBe(200);
            expect(mockProductService.findAll).toHaveBeenCalled();
        });
    });

    describe('Protected Routes', () => {
        it('should reject access to protected routes without authentication', async () => {
            // Test POST /products (create product - requires auth)
            const createResponse = await request(app)
                .post('/products')
                .send({ name: 'New Product', type: 'Test' });

            expect(createResponse.status).toBe(401);
            expect(mockProductService.create).not.toHaveBeenCalled();

            // Test GET /users (list users - requires auth)
            const usersResponse = await request(app).get('/users');
            expect(usersResponse.status).toBe(401);
            expect(mockUserService.findAll).not.toHaveBeenCalled();
        });

        it('should allow access to protected routes with valid authentication', async () => {
            // Setup mock return
            mockUserService.findById.mockResolvedValue({
                id: 'user123',
                email: 'user@example.com'
            });

            // Test GET /users/:id (self access)
            const response = await request(app)
                .get('/users/user123')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(mockUserService.findById).toHaveBeenCalledWith('user123');
        });
    });

    describe('Role-Based Access Control', () => {
        it('should deny access if user role is insufficient', async () => {
            // Try to create a product (admin only)
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'New Product', type: 'Test' });

            expect(response.status).toBe(403); // Forbidden
            expect(mockProductService.create).not.toHaveBeenCalled();
        });

        it('should allow access with admin role', async () => {
            // Setup mock
            mockProductService.create.mockResolvedValue({
                productId: 'product123',
                name: 'New Product',
                type: 'Test'
            });

            // Try to create a product
            const response = await request(app)
                .post('/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'New Product', type: 'Test' });

            expect(response.status).toBe(201); // Created
            expect(mockProductService.create).toHaveBeenCalled();
        });
    });

    describe('Self Access Control', () => {
        it('should allow users to access their own data', async () => {
            // Mock user retrieval
            mockUserService.findById.mockResolvedValue({
                id: 'user123',
                email: 'user@example.com'
            });

            // Access own profile
            const response = await request(app)
                .get('/users/user123')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
        });

        it('should deny users access to other users data', async () => {
            // Try to access another user's profile
            const response = await request(app)
                .get('/users/another-user')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403); // Forbidden
        });

        it('should allow admins to access any user data', async () => {
            // Mock user retrieval
            mockUserService.findById.mockResolvedValue({
                id: 'user123',
                email: 'user@example.com'
            });

            // Admin accessing regular user profile
            const response = await request(app)
                .get('/users/user123')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
        });
    });

    describe('Token Validation', () => {
        it('should reject invalid token format', async () => {
            const response = await request(app)
                .get('/users')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid token format');
        });

        it('should handle missing authorization header', async () => {
            const response = await request(app)
                .get('/users');

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'No authorization header provided');
        });
    });
}); 