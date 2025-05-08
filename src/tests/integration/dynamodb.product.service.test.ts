import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from '@config/types';
import { ProductService } from '@/services/product.service';
import { IProductRepository } from '@/repositories/dynamodb/product.repository';
import { IDynamoProduct } from '@/interfaces/DbInterfaces';
import { IProductDataAdapter, DynamoProductAdapter } from '@/interfaces/adapters/product.adapter.interface';
import { ProductResponseDTO } from '@/models/dto/product.dto';

describe('ProductService with DynamoDB Adapter (Unit)', () => {
    let container: Container;
    let productService: ProductService;
    let mockProductRepository: jest.Mocked<IProductRepository>;
    let productAdapter: IProductDataAdapter;

    // Mock products data
    const mockProducts: IDynamoProduct[] = [
        {
            id: '1',
            name: 'Test Product 1',
            type: 'electronics',
            price: 100,
            inventory: 10,
            isFeatured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Test Product 2',
            type: 'clothing',
            price: 50,
            inventory: 20,
            isFeatured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    // Expected response DTOs
    const expectedDTOs: ProductResponseDTO[] = mockProducts.map(p => ({
        productId: p.id,
        name: p.name,
        type: p.type,
        price: p.price,
        inventory: p.inventory,
        isFeatured: p.isFeatured,
        createdAt: new Date(p.createdAt as string),
        updatedAt: new Date(p.updatedAt as string)
    }));

    beforeEach(() => {
        // Create a new container for each test
        container = new Container();

        // Create mock repository
        mockProductRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByType: jest.fn(),
            findByPriceRange: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        // Use real adapter
        productAdapter = new DynamoProductAdapter();

        // Bind mocks to container
        container.bind<IProductRepository>(TYPES.IProductRepository).toConstantValue(mockProductRepository);
        container.bind<IProductDataAdapter>(TYPES.IProductDataAdapter).toConstantValue(productAdapter);
        container.bind<ProductService>(TYPES.IProductService).to(ProductService);

        // Get service instance
        productService = container.get<ProductService>(TYPES.IProductService);
    });

    describe('findAll', () => {
        test('should return all products as DTOs', async () => {
            // Arrange
            mockProductRepository.findAll.mockResolvedValue(mockProducts);

            // Act
            const result = await productService.findAll();

            // Assert
            expect(mockProductRepository.findAll).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0].productId).toBe('1');
            expect(result[1].productId).toBe('2');
        });
    });

    describe('findById', () => {
        test('should return a product by ID as DTO', async () => {
            // Arrange
            mockProductRepository.findById.mockResolvedValue(mockProducts[0]);

            // Act
            const result = await productService.findById('1');

            // Assert
            expect(mockProductRepository.findById).toHaveBeenCalledWith('1');
            expect(result).toBeTruthy();
            expect(result?.productId).toBe('1');
            expect(result?.name).toBe('Test Product 1');
        });

        test('should return null if product not found', async () => {
            // Arrange
            mockProductRepository.findById.mockResolvedValue(null);

            // Act
            const result = await productService.findById('999');

            // Assert
            expect(mockProductRepository.findById).toHaveBeenCalledWith('999');
            expect(result).toBeNull();
        });
    });

    describe('findByType', () => {
        test('should return products by type as DTOs', async () => {
            // Arrange
            mockProductRepository.findByType.mockResolvedValue([mockProducts[0]]);

            // Act
            const result = await productService.findByType('electronics');

            // Assert
            expect(mockProductRepository.findByType).toHaveBeenCalledWith('electronics');
            expect(result).toHaveLength(1);
            expect(result[0].productId).toBe('1');
            expect(result[0].type).toBe('electronics');
        });
    });

    describe('findByPriceRange', () => {
        test('should return products by price range as DTOs', async () => {
            // Arrange
            mockProductRepository.findByPriceRange.mockResolvedValue([mockProducts[0]]);

            // Act
            const result = await productService.findByPriceRange(50, 150);

            // Assert
            expect(mockProductRepository.findByPriceRange).toHaveBeenCalledWith(50, 150);
            expect(result).toHaveLength(1);
            expect(result[0].productId).toBe('1');
            expect(result[0].price).toBe(100);
        });
    });

    describe('create', () => {
        test('should create a new product and return as DTO', async () => {
            // Arrange
            const productData = {
                name: 'New Product',
                type: 'electronics',
                price: 200
            };

            const createdProduct: IDynamoProduct = {
                id: '3',
                ...productData,
                inventory: 0,
                isFeatured: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            mockProductRepository.create.mockResolvedValue(createdProduct);

            // Act
            const result = await productService.create(productData);

            // Assert
            expect(mockProductRepository.create).toHaveBeenCalled();
            expect(result.productId).toBe('3');
            expect(result.name).toBe('New Product');
        });
    });

    describe('update', () => {
        test('should update an existing product and return as DTO', async () => {
            // Arrange
            const updateData = {
                name: 'Updated Product',
                price: 150
            };

            const updatedProduct: IDynamoProduct = {
                ...mockProducts[0],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            mockProductRepository.update.mockResolvedValue(updatedProduct);

            // Act
            const result = await productService.update('1', updateData);

            // Assert
            expect(mockProductRepository.update).toHaveBeenCalled();
            expect(result?.productId).toBe('1');
            expect(result?.name).toBe('Updated Product');
            expect(result?.price).toBe(150);
        });

        test('should return null if product to update not found', async () => {
            // Arrange
            mockProductRepository.update.mockResolvedValue(null);

            // Act
            const result = await productService.update('999', { name: 'Updated Product' });

            // Assert
            expect(mockProductRepository.update).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        test('should delete a product', async () => {
            // Arrange
            mockProductRepository.delete.mockResolvedValue(true);

            // Act
            const result = await productService.delete('1');

            // Assert
            expect(mockProductRepository.delete).toHaveBeenCalledWith('1');
            expect(result).toBe(true);
        });

        test('should return false if product to delete not found', async () => {
            // Arrange
            mockProductRepository.delete.mockResolvedValue(false);

            // Act
            const result = await productService.delete('999');

            // Assert
            expect(mockProductRepository.delete).toHaveBeenCalledWith('999');
            expect(result).toBe(false);
        });
    });
}); 