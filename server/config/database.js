import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Make sure this is here

dotenv.config(); // Make sure this is called here

const connectDB = async () => {
  try {
    // Use environment variable or fallback to default local MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/great-outdoors-ecommerce';
    
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log('📍 MongoDB URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 MongoDB Installation Options:');
      console.log('   Option 1: Install MongoDB locally');
      console.log('   - Download: https://www.mongodb.com/try/download/community');
      console.log('   - Install and start the MongoDB service');
      console.log('   ');
      console.log('   Option 2: Use MongoDB Atlas (Cloud)');
      console.log('   - Go to: https://www.mongodb.com/atlas');
      console.log('   - Create a free cluster');
      console.log('   - Get connection string and update MONGO_URI in .env');
      console.log('   ');
      console.log('   Option 3: Use Docker');
      console.log('   - Run: docker run -d -p 27017:27017 --name mongodb mongo');
    }
    
    throw error; // Re-throw to let server.js handle it
  }
};

export default connectDB;