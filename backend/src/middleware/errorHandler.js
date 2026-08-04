import { config } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

// ─── Mongoose error transformers ────────────────────────────────────────────

/**
 * Handles invalid MongoDB ObjectId (e.g. /api/v1/users/not-an-id)
 * Mongoose throws a CastError when a route param cannot be cast to ObjectId.
 */
const handleCastError = (err) =>
  new ApiError(400, `Invalid value '${err.value}' for field '${err.path}'.`);

/**
 * Handles MongoDB duplicate key errors (error code 11000).
 * Raised when a unique-indexed field (e.g. email) already exists in the DB.
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new ApiError(
    409,
    `An account with ${field} '${value}' already exists. Please use a different ${field}.`
  );
};

/**
 * Handles Mongoose schema validation errors.
 * Collects all failing field messages into an `errors` array for clear feedback.
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new ApiError(400, 'Validation failed. Please check the provided data.', errors);
};

// ─── JWT error transformers ──────────────────────────────────────────────────

const handleJwtError = () =>
  new ApiError(401, 'Invalid authentication token. Please login again.');

const handleJwtExpiredError = () =>
  new ApiError(401, 'Your session has expired. Please login again.');

// ─── Global Error Handler ────────────────────────────────────────────────────

/**
 * Express global error handling middleware.
 *
 * Must be registered LAST in app.js (after all routes).
 * Receives errors forwarded via next(err) or thrown in asyncHandler-wrapped handlers.
 *
 * Strategy:
 * - Operational errors (ApiError instances): return meaningful 4xx/5xx to client
 * - Mongoose errors: transform into ApiError before responding
 * - Unknown/programming errors: log full stack, return generic 500 (never leak internals)
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let error = err;

  // Transform known Mongoose / JWT errors into ApiErrors
  if (err.name === 'CastError')          error = handleCastError(err);
  if (err.code === 11000)                error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError')    error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError')  error = handleJwtError();
  if (err.name === 'TokenExpiredError')  error = handleJwtExpiredError();

  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational === true;

  // Log unexpected (non-operational) errors in full — these are bugs
  if (!isOperational) {
    console.error('🔴 UNEXPECTED ERROR:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  const response = {
    success: false,
    message: isOperational
      ? error.message
      : 'Something went wrong on the server. Please try again later.',
  };

  // Include field-level errors only when present (e.g. validation failures)
  if (isOperational && error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  // In development, attach stack trace for non-operational errors only
  if (config.nodeEnv === 'development' && !isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
