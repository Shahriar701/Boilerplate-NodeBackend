require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Get user ID for Shahriar
    const UserModel = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String
    }));
    
    const user = await UserModel.findOne({ email: 'shahriar.new@hotmail.com' });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    
    console.log('Found user:', user.name, user._id);
    
    // Define Product schema
    const ProductModel = mongoose.model('Product', new mongoose.Schema({
      name: String,
      description: String,
      price: Number,
      type: String,
      sku: String,
      createdBy: mongoose.Schema.Types.ObjectId,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }));
    
    // Define dummy products
    const dummyProducts = [
      {
        name: 'Premium Laptop',
        description: 'High-performance laptop with 16GB RAM and 512GB SSD',
        price: 1299.99,
        type: 'electronics',
        sku: 'LAPTOP-001',
        createdBy: user._id
      },
      {
        name: 'Wireless Headphones',
        description: 'Noise-cancelling wireless headphones with 30-hour battery life',
        price: 249.99,
        type: 'electronics',
        sku: 'HEADPHONE-002',
        createdBy: user._id
      },
      {
        name: 'Smart Watch',
        description: 'Fitness tracker with heart rate monitor and sleep tracking',
        price: 199.99,
        type: 'wearable',
        sku: 'WATCH-003',
        createdBy: user._id
      },
      {
        name: 'Coffee Machine',
        description: 'Automated coffee machine with milk frother',
        price: 349.99,
        type: 'home',
        sku: 'COFFEE-004',
        createdBy: user._id
      },
      {
        name: 'Robot Vacuum',
        description: 'Smart robot vacuum with mapping technology',
        price: 499.99,
        type: 'home',
        sku: 'VACUUM-005',
        createdBy: user._id
      }
    ];
    
    // Create products
    for (const product of dummyProducts) {
      try {
        const createdProduct = await ProductModel.create(product);
        console.log(`Created product: ${createdProduct.name} with ID: ${createdProduct._id}`);
      } catch (error) {
        console.error(`Failed to create product ${product.name}:`, error);
      }
    }
    
    console.log('Finished creating products');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  }); 