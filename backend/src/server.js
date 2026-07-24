import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 FoodBridge API running on port ${PORT}`);
    });

    server.on('error', (error) => {
      console.error('Server failed to start:', error.message);
      process.exit(1);
    });

    process.on('SIGINT', () => {
      console.log('\nShutting down server...');
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed.');
        } catch (error) {
          console.error('Error closing MongoDB connection:', error.message);
        }
        console.log('Server stopped successfully.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();