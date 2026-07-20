import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stranger_chat';
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not crash the server in local development if mongo is not running
    // but log a warning.
    console.warn('Proceeding without strict database locking. Please ensure MongoDB is running if session tracking is needed.');
  }
};

export default connectDB;
