import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Make sure this is here

dotenv.config(); // Make sure this is called here

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // This line needs MONGO_URI to be defined
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;