import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import jwt from 'jsonwebtoken';
import { TYPES } from '@config/types';
import { IProductService } from '@/interfaces/product.service.interfaces';

// Import controller for route registration
import '@controllers/product.controller';

// Mock product service
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
  expect(normalizedActual.productId).toEqual(normalizedExpected.productId);
  expect(normalizedActual.name).toEqual(normalizedExpected.name);
  expect(normalizedActual.type).toEqual(normalizedExpected.type);

  // Compare optional properties if they exist
  if (normalizedExpected.description) {
    expect(normalizedActual.description).toEqual(normalizedExpected.description);
  }
  if (normalizedExpected.price !== undefined) {
    expect(normalizedActual.price).toEqual(normalizedExpected.price);
  }
  if (normalizedExpected.inventory !== undefined) {
    expect(normalizedActual.inventory).toEqual(normalizedExpected.inventory);
  }
  if (normalizedExpected.isFeatured !== undefined) {
    expect(normalizedActual.isFeatured).toEqual(normalizedExpected.isFeatured);
  }

  // Verify dates exist but don't compare exact values
  expect(normalizedActual.createdAt).toBeInstanceOf(Date);
  expect(normalizedActual.updatedAt).toBeInstanceOf(Date);
};

describe('ProductController (Integration)', () => {
  let app: express.Application;
  let container: Container;
  let adminToken: string;

  // Helper to create JWT tokens
  const createToken = (payload: any): string => {
    return jwt.sign(payload, mockConfig.jwtSecret);
  };

  beforeAll(() => {
    container = new Container();

    // Bind mock service and config
    container.bind<IProductService>(TYPES.IProductService).toConstantValue(mockProductService);
    container.bind(TYPES.IEnvironmentConfig).toConstantValue(mockConfig);

    // Create server with controllers
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

    // Create admin token for authenticated routes
    adminToken = createToken({ id: 'admin123', email: 'admin@example.com', roles: ['admin'] });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      // Setup
      const products = [
        { productId: '1', name: 'Test Product', type: 'Electronics' },
        { productId: '2', name: 'Another Product', type: 'Clothing' }
      ];

      mockProductService.findAll.mockResolvedValue(products);

      // Execute
      const response = await request(app).get('/products');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      // Setup
      const product = { productId: '1', name: 'Test Product', type: 'Electronics' };
      mockProductService.findById.mockResolvedValue(product);

      // Execute
      const response = await request(app).get('/products/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(product);
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
      const products = [
        { productId: '1', name: 'Test Product', type: 'Electronics' },
        { productId: '2', name: 'Another Product', type: 'Electronics' }
      ];
      mockProductService.findByType.mockResolvedValue(products);

      // Execute
      const response = await request(app).get('/products/type/Electronics');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
      expect(mockProductService.findByType).toHaveBeenCalledWith('Electronics');
    });
  });

  describe('GET /products/search', () => {
    it('should return products in price range', async () => {
      // Setup
      const products = [
        { productId: '1', name: 'Test Product', type: 'Electronics', price: 100 },
        { productId: '2', name: 'Another Product', type: 'Electronics', price: 150 }
      ];
      mockProductService.findByPriceRange.mockResolvedValue(products);

      // Execute
      const response = await request(app).get('/products/search?min=50&max=200');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(products);
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
      const newProductData = {
        name: 'New Product',
        type: 'Furniture',
        description: 'A new product',
        price: 149.99,
        inventory: 5,
        isFeatured: false
      };

      const createdProduct = {
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
      expectObjectsToMatch(response.body, createdProduct);
      expect(mockProductService.create).toHaveBeenCalledWith(newProductData);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      // Setup
      const updateData = { name: 'Updated Product', price: 199.99 };
      const updatedProduct = {
        productId: '1',
        name: 'Updated Product',
        type: 'Electronics',
        price: 199.99,
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
      expectObjectsToMatch(response.body, updatedProduct);
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