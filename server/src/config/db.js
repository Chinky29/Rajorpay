import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[Database] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] Disconnected from MongoDB');
      isConnected = false;
    });

  } catch (error) {
    console.error(`[Database] Failed to connect to MongoDB: ${error.message}`);
    // In development, log the error without exiting immediately if MongoDB is not running locally yet
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
};

export const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};
