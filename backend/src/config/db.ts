import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import seedDatabase from './seed';

let mongoMemoryServer: MongoMemoryServer | null = null;

const connectDB = async (): Promise<void> => {
  try {
    let uri = process.env.MONGODB_URI as string;

    if (!uri || process.env.NODE_ENV !== 'production') {
      console.log('🔧 Starting In-Memory MongoDB Server...');
      mongoMemoryServer = await MongoMemoryServer.create();
      uri = mongoMemoryServer.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    if (process.env.NODE_ENV !== 'production' || process.env.SEED_ON_START === 'true') {
      await seedDatabase();
    }
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
