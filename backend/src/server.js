// ─── IMPORTANT: Validate env vars FIRST, before any other import ─────────────
// This is a fail-fast pattern. If required environment variables are missing,
// the server will exit immediately with a clear error message rather than
// crashing later with a cryptic undefined reference.
import 'dotenv/config';
import validateEnv from './config/env.js';
validateEnv();

// ─── App imports (after env is validated) ────────────────────────────────────
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import { config } from './config/env.js';

// ─── Server Bootstrap ────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(
        `🚀 FoodBridge API running on port ${config.port} [${config.nodeEnv}]`
      );
    });

    server.on('error', (error) => {
      console.error('❌ Server failed to start:', error.message);
      process.exit(1);
    });

    // ─── Graceful Shutdown ────────────────────────────────────────────────────
    // Handles both SIGINT (Ctrl+C in terminal) and SIGTERM (Docker stop, systemd, Kubernetes).
    // Stops accepting new connections, waits for in-flight requests to finish,
    // then cleanly closes the MongoDB connection before exiting.

    const gracefulShutdown = (signal) => {
      console.log(`\n⚡ ${signal} received. Initiating graceful shutdown...`);

      server.close(async () => {
        console.log('🔌 HTTP server closed. No new connections accepted.');

        try {
          await mongoose.connection.close();
          console.log('✅ MongoDB connection closed successfully.');
        } catch (error) {
          console.error('❌ Error closing MongoDB connection:', error.message);
        }

        console.log('👋 FoodBridge API stopped gracefully.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Handle unhandled promise rejections — log and exit to avoid undefined state
    process.on('unhandledRejection', (reason) => {
      console.error('🔴 Unhandled Promise Rejection:', reason);
      gracefulShutdown('UnhandledRejection');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();