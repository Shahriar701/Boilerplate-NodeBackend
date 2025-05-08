import 'reflect-metadata';
import dotenv from 'dotenv';
import { container } from '@config/inversify.config';
import { TYPES } from '@config/types';
import { IDatabaseConnection } from '@database/database.interface';
import { IProductService } from '@/interfaces/product.service.interfaces';
import { CreateProductDTO } from '@/models/dto/product.dto';

// Load environment variables
dotenv.config();

async function seedProducts() {
  try {
    console.log('Starting database seed process...');

    // Connect to the database
    const dbConnection = container.get<IDatabaseConnection>(TYPES.IDatabaseConnection);
    await dbConnection.connect();
    console.log('Database connected successfully');

    // Get the product service
    const productService = container.get<IProductService>(TYPES.IProductService);

    // Sample product data
    const products: CreateProductDTO[] = [
      {
        name: 'Smartphone X',
        type: 'electronics',
        description: 'Latest smartphone with advanced features',
        price: 699.99,
        inventory: 50,
        isFeatured: true
      },
      {
        name: 'Laptop Pro',
        type: 'electronics',
        description: 'High-performance laptop for professionals',
        price: 1299.99,
        inventory: 30,
        isFeatured: true
      },
      {
        name: 'Wireless Headphones',
        type: 'electronics',
        description: 'Noise-cancelling wireless headphones',
        price: 199.99,
        inventory: 100,
        isFeatured: false
      },
      {
        name: 'Smart Watch',
        type: 'electronics',
        description: 'Fitness tracking smartwatch',
        price: 249.99,
        inventory: 75,
        isFeatured: true
      },
      {
        name: 'Cotton T-Shirt',
        type: 'clothing',
        description: 'Comfortable cotton t-shirt',
        price: 19.99,
        inventory: 200,
        isFeatured: false
      },
      {
        name: 'Denim Jeans',
        type: 'clothing',
        description: 'Classic denim jeans',
        price: 49.99,
        inventory: 150,
        isFeatured: false
      },
      {
        name: 'Running Shoes',
        type: 'footwear',
        description: 'Lightweight running shoes',
        price: 89.99,
        inventory: 120,
        isFeatured: true
      },
      {
        name: 'Office Chair',
        type: 'furniture',
        description: 'Ergonomic office chair',
        price: 199.99,
        inventory: 40,
        isFeatured: false
      },
      {
        name: 'Coffee Table',
        type: 'furniture',
        description: 'Modern coffee table',
        price: 149.99,
        inventory: 25,
        isFeatured: false
      },
      {
        name: 'Bookshelf',
        type: 'furniture',
        description: 'Wooden bookshelf',
        price: 129.99,
        inventory: 35,
        isFeatured: false
      }
    ];

    // Insert products
    console.log(`Inserting ${products.length} products...`);
    
    for (const productData of products) {
      try {
        const product = await productService.create(productData);
        console.log(`Created product: ${product.name} (ID: ${product.productId})`);
      } catch (error) {
        console.error(`Failed to create product ${productData.name}:`, error);
      }
    }

    console.log('Seed completed successfully');
    
    // Disconnect from database
    await dbConnection.disconnect();
    console.log('Database disconnected');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seedProducts(); 