/**
 * Environment Configuration
 *
 * Validates required environment variables at startup (fail-fast pattern).
 * Exports a single typed `config` object consumed throughout the application.
 * Avoids calling `process.env` directly anywhere else in the codebase.
 */

const REQUIRED_VARS = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN'];

/**
 * Validates that all required environment variables are present.
 * Call this once at the very top of server.js before anything else.
 * @throws {Error} If any required variable is missing.
 */
const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}. ` +
        'Please check your .env file.'
    );
  }
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',

  db: {
    uri: process.env.MONGODB_URI,
    serverSelectionTimeoutMS: 5000,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cors: {
    // Restrict to Angular dev server; override via CORS_ORIGIN in production
    allowedOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  },

  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,                   // max 10 requests per window per IP
    },
  },

  bcrypt: {
    saltRounds: 12,
  },
};

export default validateEnv;
