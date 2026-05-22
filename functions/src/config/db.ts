import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return; // already connected
    mongoose.connection.on('connected', () =>
      console.log('MongoDB connected successfully'));
    await mongoose.connect(process.env.MONGODB_URI as string, {});
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

export default connectDB;
