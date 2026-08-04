import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middleware/errorHandler.js';
import ApiError from './utils/ApiError.js';

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
// helmet sets ~14 HTTP security headers automatically:
// - Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
//   Strict-Transport-Security (HSTS), etc.
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
// Restrict cross-origin requests to the Angular dev server (or production URL).
// Override via CORS_ORIGIN env var in production.
app.use(
  cors({
    origin: config.cors.allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── HTTP Request Logging ────────────────────────────────────────────────────
// Only enabled in development. In production, use a dedicated logging service.
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ─── Body Parsers ────────────────────────────────────────────────────────────
// Limit request body to 10kb to mitigate payload-based DoS attacks.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
// Publicly accessible — used by load balancers, uptime monitors, CI pipelines.
app.get(`/api/${config.apiVersion}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FoodBridge API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use(`/api/${config.apiVersion}/auth`, authRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
// Catches any request that did not match a defined route above.
app.use((req, res, next) => {
  next(new ApiError(404, `Route '${req.method} ${req.originalUrl}' not found.`));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be registered LAST — Express identifies error handlers by their 4-parameter signature.
app.use(errorHandler);

export default app;