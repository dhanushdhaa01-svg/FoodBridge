/**
 * ApiError
 *
 * Custom error class for operational (expected) application errors.
 * Operational errors have a meaningful HTTP status code and a user-safe message.
 * Non-operational errors (programming mistakes, unexpected failures) bubble up
 * as generic 500s through the global error handler.
 *
 * Usage:
 *   throw new ApiError(404, 'User not found.');
 *   throw new ApiError(400, 'Validation failed.', ['Field x is required.']);
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 409)
   * @param {string} message    - User-safe error message
   * @param {string[]} errors   - Optional array of field-level validation messages
   */
  constructor(statusCode, message, errors = []) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = true; // Signals the error handler this is a known, handled error

    // Capture a clean stack trace that excludes the constructor frame
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
