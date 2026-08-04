import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * authenticate middleware
 *
 * Verifies the JWT from the Authorization header and attaches the
 * authenticated user document to `req.user`.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 *
 * Failure scenarios (all return 401):
 * - No / malformed Authorization header
 * - Invalid or tampered token (JsonWebTokenError)
 * - Expired token (TokenExpiredError)
 * - User no longer exists in DB (deleted after token was issued)
 * - User's account has been deactivated
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(
      401,
      'Authentication required. Please provide a valid Bearer token.'
    );
  }

  const token = authHeader.split(' ')[1];

  // jwt.verify throws JsonWebTokenError or TokenExpiredError on failure —
  // both are caught by the global error handler and transformed into 401s.
  const decoded = jwt.verify(token, config.jwt.secret);

  // Re-fetch user from DB to ensure they still exist and are active.
  // This also ensures we have the latest `isApproved` and `isActive` values.
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(
      401,
      'The account associated with this token no longer exists.'
    );
  }

  if (!user.isActive) {
    throw new ApiError(
      401,
      'Your account has been deactivated. Please contact support.'
    );
  }

  req.user = user;
  next();
});

export default authenticate;
