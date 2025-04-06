import { ProductBuilder } from '../product.builder';
import { CreateProductDTO, UpdateProductDTO } from '@/models/dto/product.dto';

describe('ProductBuilder', () => {
    describe('basic building functionality', () => {
        it('should build a valid product with required fields', () => {
            const product = new ProductBuilder()
                .setName('Test Product')
                .setType('Electronics')
                .build();

            expect(product).toHaveProperty('name', 'Test Product');
            expect(product).toHaveProperty('type', 'Electronics');
            expect(product).toHaveProperty('price', 0); // Default value
            expect(product).toHaveProperty('inventory', 0); // Default value
            expect(product).toHaveProperty('isFeatured', false); // Default value
            expect(product).toHaveProperty('createdAt');
            expect(product).toHaveProperty('updatedAt');
        });

        it('should throw an error when name is missing', () => {
            const builder = new ProductBuilder().setType('Electronics');
            expect(() => builder.build()).toThrow('Product name is required');
        });

        it('should throw an error when type is missing', () => {
            const builder = new ProductBuilder().setName('Test Product');
            expect(() => builder.build()).toThrow('Product type is required');
        });

        it('should build a product with all fields set', () => {
            const now = new Date();
            const product = new ProductBuilder()
                .setName('Complete Product')
                .setType('Electronics')
                .setDescription('A complete product description')
                .setPrice(99.99)
                .setInventory(100)
                .setFeatured(true)
                .setCreatedAt(now)
                .setUpdatedAt(now)
                .build();

            expect(product).toHaveProperty('name', 'Complete Product');
            expect(product).toHaveProperty('type', 'Electronics');
            expect(product).toHaveProperty('description', 'A complete product description');
            expect(product).toHaveProperty('price', 99.99);
            expect(product).toHaveProperty('inventory', 100);
            expect(product).toHaveProperty('isFeatured', true);
            expect(product).toHaveProperty('createdAt', now);
            expect(product).toHaveProperty('updatedAt', now);
        });
    });

    describe('static factory methods', () => {
        it('should create a builder from a CreateProductDTO', () => {
            const dto: CreateProductDTO = {
                name: 'DTO Product',
                type: 'Clothing',
                description: 'Created from DTO',
                price: 49.99,
                inventory: 50,
                isFeatured: true
            };

            const product = ProductBuilder.fromDTO(dto).build();

            expect(product).toHaveProperty('name', 'DTO Product');
            expect(product).toHaveProperty('type', 'Clothing');
            expect(product).toHaveProperty('description', 'Created from DTO');
            expect(product).toHaveProperty('price', 49.99);
            expect(product).toHaveProperty('inventory', 50);
            expect(product).toHaveProperty('isFeatured', true);
        });

        it('should create a builder from a partial UpdateProductDTO', () => {
            const dto: UpdateProductDTO = {
                price: 29.99,
                inventory: 75
            };

            // Since this is an update, we need to set the required fields manually
            const product = ProductBuilder.fromDTO(dto)
                .setName('Updated Product')
                .setType('Books')
                .build();

            expect(product).toHaveProperty('name', 'Updated Product');
            expect(product).toHaveProperty('type', 'Books');
            expect(product).toHaveProperty('price', 29.99);
            expect(product).toHaveProperty('inventory', 75);
        });

        it('should create a featured product', () => {
            const product = ProductBuilder.featuredProduct('Featured', 'Special').build();

            expect(product).toHaveProperty('name', 'Featured');
            expect(product).toHaveProperty('type', 'Special');
            expect(product).toHaveProperty('isFeatured', true);
        });
    });
}); 