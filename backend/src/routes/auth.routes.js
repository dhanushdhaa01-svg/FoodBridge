import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import authController from '../controllers/auth.controller.js';
import authenticate from '../middleware/authenticate.js';
import { config } from '../config/env.js';

const router = Router();

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
// Applied only to auth endpoints to prevent brute-force and credential-stuffing attacks.
// 10 requests per 15-minute window per IP address.

const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  standardHeaders: true,  // Return RateLimit-* headers in the response
  legacyHeaders: false,   // Disable the X-RateLimit-* headers (deprecated)
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
    });
  },
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Public — rate limited
 * Registers a new donor or NGO account.
 */
router.post('/register', authLimiter, authController.register);

/**
 * POST /api/v1/auth/login
 * Public — rate limited
 * Authenticates a user and returns a JWT access token.
 */
router.post('/login', authLimiter, authController.login);

/**
 * GET /api/v1/auth/me
 * Protected — requires valid Bearer token
 * Returns the currently authenticated user's profile.
 */
router.get('/me', authenticate, authController.getMe);

export default router;
