import { expect } from '@jest/globals';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { TYPES } from '@config/types';
import { IProductService } from '@/interfaces/product.service.interface';
import express from 'express';
import request from 'supertest';
import { ProductResponseDTO, CreateProductDTO, UpdateProductDTO } from '@/models/dto/product.dto';
import jwt from 'jsonwebtoken';

// Import controller for route registration
import '@controllers/product.controller';

// Mock auth middleware
jest.mock('@/middlewares/auth.middleware', () => ({
  createAuthMiddleware: () => (req: any, res: any, next: any) => next(),
  hasRoles: () => (req: any, res: any, next: any) => next()
}));

// Tokens for authentication
let adminToken: string;
let userToken: string;

// Helper to match objects with key subset
const expectObjectsToMatch = (received: any, expected: any) => {
  Object.keys(expected).forEach(key => {
    expect(received[key]).toEqual(expected[key]);
  });
};

// Helper to convert dates to strings in objects for comparison
const convertDatesToStrings = (obj: any): any => {
  const result = { ...obj };
  if (result.createdAt instanceof Date) {
    result.createdAt = result.createdAt.toISOString();
  }
  if (result.updatedAt instanceof Date) {
    result.updatedAt = result.updatedAt.toISOString();
  }
  return result;
};

// Mock config for auth
const mockConfig = {
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  nodeEnv: 'test',
  port: 3000
};

describe('ProductController (Integration)', () => {
  let app: express.Application;
  let container: Container;
  let mockProductService: jest.Mocked<IProductService>;

  beforeAll(() => {
    // Create container and register mocks
    container = new Container();

    // Create ProductService mock
    mockProductService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByType: jest.fn(),
      findByPriceRange: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<IProductService>;

    // Bind mock service and config
    container.bind<IProductService>(TYPES.IProductService).toConstantValue(mockProductService);
    container.bind(TYPES.IEnvironmentConfig).toConstantValue(mockConfig);

    // Add auth config binding
    container.bind(TYPES.AuthConfig).toConstantValue({
      secret: 'test-secret',
      tokenExpiration: '1h'
    });

    // Create and configure Express server
    const server = new InversifyExpressServer(container);
    server.setConfig((app) => {
      app.use(express.json());

      // Attach container to request for auth middleware
      app.use((req, _res, next) => {
        (req as any).container = container;
        next();
      });
    });

    // Build Express application
    app = server.build();

    // Create tokens for authentication
    adminToken = jwt.sign({ id: 'admin123', email: 'admin@example.com', roles: ['admin'] }, 'test-secret', { expiresIn: '1h' });
    userToken = jwt.sign({ id: 'user123', email: 'user@example.com', roles: ['user'] }, 'test-secret', { expiresIn: '1h' });
  });

  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /products', () => {
    test('should return all products', async () => {
      // Create mock return data
      const products: ProductResponseDTO[] = [
        {
          productId: '1',
          name: 'Test Product 1',
          type: 'electronics',
          description: 'A test product',
          price: 100,
          inventory: 10,
          isFeatured: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          productId: '2',
          name: 'Test Product 2',
          type: 'clothing',
          description: 'Another test product',
          price: 50,
          inventory: 20,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Configure mock
      mockProductService.findAll.mockResolvedValue(products);

      // Execute request
      const response = await request(app).get('/products');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products.map(p => convertDatesToStrings(p)));
      expect(mockProductService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      // Setup
      const product: ProductResponseDTO = {
        productId: '1',
        name: 'Test Product',
        type: 'Electronics',
        description: 'A test product',
        price: 100,
        inventory: 10,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockProductService.findById.mockResolvedValue(product);

      // Execute
      const response = await request(app).get('/products/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(convertDatesToStrings(product));
      expect(mockProductService.findById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if product not found', async () => {
      // Setup
      mockProductService.findById.mockResolvedValue(null);

      // Execute
      const response = await request(app).get('/products/999');

      // Assert
      expect(response.status).toBe(404);
      expect(mockProductService.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('GET /products/type/:type', () => {
    it('should return products by type', async () => {
      // Setup
      const products: ProductResponseDTO[] = [
        {
          productId: '1',
          name: 'Test Product',
          type: 'Electronics',
          description: 'A test product',
          price: 100,
          inventory: 10,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          productId: '2',
          name: 'Another Product',
          type: 'Electronics',
          description: 'Another test product',
          price: 150,
          inventory: 5,
          isFeatured: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      mockProductService.findByType.mockResolvedValue(products);

      // Execute
      const response = await request(app).get('/products/type/Electronics');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products.map(p => convertDatesToStrings(p)));
      expect(mockProductService.findByType).toHaveBeenCalledWith('Electronics');
    });
  });

  describe('GET /products/search', () => {
    it('should return products in price range', async () => {
      // Setup
      const products: ProductResponseDTO[] = [
        {
          productId: '1',
          name: 'Test Product',
          type: 'Electronics',
          description: 'A test product',
          price: 100,
          inventory: 10,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          productId: '2',
          name: 'Another Product',
          type: 'Electronics',
          description: 'Another test product',
          price: 150,
          inventory: 5,
          isFeatured: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      mockProductService.findByPriceRange.mockResolvedValue(products);

      // Execute
      const response = await request(app).get('/products/search?min=50&max=200');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products.map(p => convertDatesToStrings(p)));
      expect(mockProductService.findByPriceRange).toHaveBeenCalledWith(50, 200);
    });

    it('should return 400 if price range parameters are missing', async () => {
      // Execute
      const response = await request(app).get('/products/search');

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      // Setup
      const newProductData: CreateProductDTO = {
        name: 'New Product',
        type: 'Furniture',
        description: 'A new product',
        price: 149.99,
        inventory: 5,
        isFeatured: false
      };

      const createdProduct: ProductResponseDTO = {
        productId: '2',
        ...newProductData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockProductService.create.mockResolvedValue(createdProduct);

      // Execute
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProductData);

      expect(response.status).toBe(201);
      expectObjectsToMatch(response.body, convertDatesToStrings(createdProduct));
      expect(mockProductService.create).toHaveBeenCalledWith(newProductData);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      // Setup
      const updateData: UpdateProductDTO = {
        name: 'Updated Product',
        price: 199.99
      };

      const updatedProduct: ProductResponseDTO = {
        productId: '1',
        name: 'Updated Product',
        type: 'Electronics',
        description: 'A test product',
        price: 199.99,
        inventory: 10,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockProductService.update.mockResolvedValue(updatedProduct);

      // Execute
      const response = await request(app)
        .put('/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expectObjectsToMatch(response.body, convertDatesToStrings(updatedProduct));
      expect(mockProductService.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should return 404 if product to update not found', async () => {
      // Setup
      mockProductService.update.mockResolvedValue(null);

      // Execute
      const response = await request(app)
        .put('/products/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Product' });

      expect(response.status).toBe(404);
      expect(mockProductService.update).toHaveBeenCalledWith('999', { name: 'Updated Product' });
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      // Setup
      mockProductService.delete.mockResolvedValue(true);

      // Execute
      const response = await request(app)
        .delete('/products/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
      expect(mockProductService.delete).toHaveBeenCalledWith('1');
    });

    it('should return 404 if product to delete not found', async () => {
      // Setup
      mockProductService.delete.mockResolvedValue(false);

      // Execute
      const response = await request(app)
        .delete('/products/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(mockProductService.delete).toHaveBeenCalledWith('999');
    });
  });
}); 