// Simple MongoDB connection test
import 'dotenv/config';
import { connectDB } from './src/db.js';
import { User, Item, Cart } from './src/models/index.js';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB successfully');
    
    // Test creating a user
    console.log('\nTesting User model...');
    const testUser = await User.createUser({
      email: 'test@example.com',
      password: 'testpassword',
      name: 'Test User'
    });
    console.log('✅ User created:', testUser.publicProfile);
    
    // Test creating an item
    console.log('\nTesting Item model...');
    const testItem = await Item.create({
      title: 'Test Product',
      description: 'A test product',
      price: 99.99,
      category: 'Test',
      imageUrl: 'https://example.com/image.jpg'
    });
    console.log('✅ Item created:', testItem);
    
    // Test creating a cart
    console.log('\nTesting Cart model...');
    const testCart = await Cart.create({
      userId: testUser._id,
      items: []
    });
    console.log('✅ Cart created:', testCart);
    
    // Clean up test data
    await User.findByIdAndDelete(testUser._id);
    await Item.findByIdAndDelete(testItem._id);
    await Cart.findByIdAndDelete(testCart._id);
    console.log('\n✅ Test data cleaned up');
    
    console.log('\n🎉 All tests passed! MongoDB is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testConnection();

