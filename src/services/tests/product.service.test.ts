import { ProductService } from '../product.service';
import { CreateProductDTO, UpdateProductDTO } from '@/models/dto/product.dto';

// Mock repository
const mockRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByType: jest.fn(),
  findByPriceRange: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Test data
const mockProduct = {
  _id: '1',
  name: 'Test Product',
  type: 'Electronics',
  description: 'A test product',
  price: 99.99,
  inventory: 10,
  isFeatured: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProductResponse = {
  productId: '1',
  name: 'Test Product',
  type: 'Electronics',
  description: 'A test product',
  price: 99.99,
  inventory: 10,
  isFeatured: true,
  createdAt: mockProduct.createdAt,
  updatedAt: mockProduct.updatedAt,
};

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    jest.clearAllMocks();
    productService = new ProductService(mockRepository as any);
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      mockRepository.findAll.mockResolvedValue([mockProduct]);
      
      const result = await productService.findAll();
      
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockProductResponse]);
    });
  });

  describe('findById', () => {
    it('should return a product by ID', async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);
      
      const result = await productService.findById('1');
      
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProductResponse);
    });

    it('should return null if product not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      
      const result = await productService.findById('999');
      
      expect(mockRepository.findById).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });
  });

  describe('findByType', () => {
    it('should return products by type', async () => {
      mockRepository.findByType.mockResolvedValue([mockProduct]);
      
      const result = await productService.findByType('Electronics');
      
      expect(mockRepository.findByType).toHaveBeenCalledWith('Electronics');
      expect(result).toEqual([mockProductResponse]);
    });

    it('should return empty array if no products of that type', async () => {
      mockRepository.findByType.mockResolvedValue([]);
      
      const result = await productService.findByType('NonExistentType');
      
      expect(mockRepository.findByType).toHaveBeenCalledWith('NonExistentType');
      expect(result).toEqual([]);
    });
  });

  describe('findByPriceRange', () => {
    it('should return products in price range', async () => {
      mockRepository.findByPriceRange.mockResolvedValue([mockProduct]);
      
      const result = await productService.findByPriceRange(50, 100);
      
      expect(mockRepository.findByPriceRange).toHaveBeenCalledWith(50, 100);
      expect(result).toEqual([mockProductResponse]);
    });

    it('should return empty array if no products in price range', async () => {
      mockRepository.findByPriceRange.mockResolvedValue([]);
      
      const result = await productService.findByPriceRange(1000, 2000);
      
      expect(mockRepository.findByPriceRange).toHaveBeenCalledWith(1000, 2000);
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDTO: CreateProductDTO = {
        name: 'New Product',
        type: 'Furniture',
        description: 'A new product',
        price: 149.99,
        inventory: 5,
        isFeatured: false,
      };
      
      const newProduct = {
        _id: '2',
        ...createProductDTO,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockRepository.create.mockResolvedValue(newProduct);
      
      const result = await productService.create(createProductDTO);
      
      expect(mockRepository.create).toHaveBeenCalledWith(createProductDTO);
      expect(result).toEqual({
        productId: '2',
        ...createProductDTO,
        createdAt: newProduct.createdAt,
        updatedAt: newProduct.updatedAt,
      });
    });
  });

  describe('update', () => {
    it('should update an existing product', async () => {
      const updateProductDTO: UpdateProductDTO = {
        name: 'Updated Product',
        price: 79.99,
      };
      
      const updatedProduct = {
        ...mockProduct,
        name: 'Updated Product',
        price: 79.99,
      };
      
      mockRepository.update.mockResolvedValue(updatedProduct);
      
      const result = await productService.update('1', updateProductDTO);
      
      expect(mockRepository.update).toHaveBeenCalledWith('1', updateProductDTO);
      expect(result).toEqual({
        ...mockProductResponse,
        name: 'Updated Product',
        price: 79.99,
      });
    });

    it('should return null if product to update not found', async () => {
      mockRepository.update.mockResolvedValue(null);
      
      const result = await productService.update('999', { name: 'Updated Product' });
      
      expect(mockRepository.update).toHaveBeenCalledWith('999', { name: 'Updated Product' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      mockRepository.delete.mockResolvedValue(true);
      
      const result = await productService.delete('1');
      
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should return false if product to delete not found', async () => {
      mockRepository.delete.mockResolvedValue(false);
      
      const result = await productService.delete('999');
      
      expect(mockRepository.delete).toHaveBeenCalledWith('999');
      expect(result).toBe(false);
    });
  });
}); 