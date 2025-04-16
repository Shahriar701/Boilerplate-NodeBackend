require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Assuming the user model has this structure
    const UserModel = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      roles: [String]
    }));
    
    // Update the user with admin role
    const email = 'shahriar.new@hotmail.com';
    const result = await UserModel.updateOne(
      { email },
      { $set: { roles: ['admin', 'user'] } }
    );
    
    console.log(`Updated user ${email} with admin role:`, result);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  }); 