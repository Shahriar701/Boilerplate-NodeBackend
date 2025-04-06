import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
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

  beforeAll(() => {
    // Set up container with mocked services
    const container = new Container();
    container.bind<IProductService>(TYPES.IProductService).toConstantValue(mockProductService);

    // Create server
    const server = new InversifyExpressServer(container);
    server.setConfig((app) => {
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
    });

    app = server.build();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { 
          productId: '1', 
          name: 'Product 1', 
          type: 'Electronics', 
          price: 99.99, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
        { 
          productId: '2', 
          name: 'Product 2', 
          type: 'Clothing', 
          price: 49.99, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
      ];

      mockProductService.findAll.mockResolvedValue(mockProducts);

      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(response.body.length).toEqual(mockProducts.length);
      
      response.body.forEach((product: any, index: number) => {
        expect(product.productId).toEqual(mockProducts[index].productId);
        expect(product.name).toEqual(mockProducts[index].name);
        expect(product.type).toEqual(mockProducts[index].type);
        expect(product.price).toEqual(mockProducts[index].price);
        expect(product.createdAt).toBeTruthy();
        expect(product.updatedAt).toBeTruthy();
      });
      
      expect(mockProductService.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      const mockProduct = { 
        productId: '1', 
        name: 'Product 1', 
        type: 'Electronics', 
        description: 'A test product',
        price: 99.99, 
        inventory: 10,
        isFeatured: true,
        createdAt: new Date(), 
        updatedAt: new Date() 
      };

      mockProductService.findById.mockResolvedValue(mockProduct);

      const response = await request(app).get('/products/1');

      expect(response.status).toBe(200);
      expectObjectsToMatch(response.body, mockProduct);
      expect(mockProductService.findById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if product not found', async () => {
      mockProductService.findById.mockResolvedValue(null);

      const response = await request(app).get('/products/999');

      expect(response.status).toBe(404);
      expect(mockProductService.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('GET /products/type/:type', () => {
    it('should return products by type', async () => {
      const mockProducts = [
        { 
          productId: '1', 
          name: 'Product 1', 
          type: 'Electronics', 
          price: 99.99, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
        { 
          productId: '3', 
          name: 'Product 3', 
          type: 'Electronics', 
          price: 149.99, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
      ];

      mockProductService.findByType.mockResolvedValue(mockProducts);

      const response = await request(app).get('/products/type/Electronics');

      expect(response.status).toBe(200);
      expect(response.body.length).toEqual(mockProducts.length);
      
      response.body.forEach((product: any, index: number) => {
        expect(product.productId).toEqual(mockProducts[index].productId);
        expect(product.name).toEqual(mockProducts[index].name);
        expect(product.type).toEqual('Electronics');
      });
      
      expect(mockProductService.findByType).toHaveBeenCalledWith('Electronics');
    });
  });

  describe('GET /products/search', () => {
    it('should return products by price range', async () => {
      const mockProducts = [
        { 
          productId: '1', 
          name: 'Product 1', 
          type: 'Electronics', 
          price: 99.99, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
      ];

      mockProductService.findByPriceRange.mockResolvedValue(mockProducts);

      const response = await request(app).get('/products/search?min=50&max=100');

      expect(response.status).toBe(200);
      expect(response.body.length).toEqual(mockProducts.length);
      expect(mockProductService.findByPriceRange).toHaveBeenCalledWith(50, 100);
    });

    it('should return 400 if min or max is missing', async () => {
      const response = await request(app).get('/products/search?min=50');
      expect(response.status).toBe(400);
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProductData = {
        name: 'New Product',
        type: 'Furniture',
        description: 'A new product',
        price: 149.99,
        inventory: 5,
        isFeatured: false,
      };

      const createdProduct = {
        productId: '3',
        ...newProductData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockProductService.create.mockResolvedValue(createdProduct);

      const response = await request(app)
        .post('/products')
        .send(newProductData);

      expect(response.status).toBe(201);
      expectObjectsToMatch(response.body, createdProduct);
      expect(mockProductService.create).toHaveBeenCalledWith(newProductData);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update an existing product', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 79.99
      };

      const updatedProduct = {
        productId: '1',
        name: 'Updated Product',
        type: 'Electronics',
        price: 79.99,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockProductService.update.mockResolvedValue(updatedProduct);

      const response = await request(app)
        .put('/products/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expectObjectsToMatch(response.body, updatedProduct);
      expect(mockProductService.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should return 404 if product to update not found', async () => {
      mockProductService.update.mockResolvedValue(null);

      const response = await request(app)
        .put('/products/999')
        .send({ name: 'Updated Product' });

      expect(response.status).toBe(404);
      expect(mockProductService.update).toHaveBeenCalledWith('999', { name: 'Updated Product' });
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      mockProductService.delete.mockResolvedValue(true);

      const response = await request(app).delete('/products/1');

      expect(response.status).toBe(204);
      expect(mockProductService.delete).toHaveBeenCalledWith('1');
    });

    it('should return 404 if product to delete not found', async () => {
      mockProductService.delete.mockResolvedValue(false);

      const response = await request(app).delete('/products/999');

      expect(response.status).toBe(404);
      expect(mockProductService.delete).toHaveBeenCalledWith('999');
    });
  });
}); 