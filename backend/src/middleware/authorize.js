import ApiError from '../utils/ApiError.js';

/**
 * authorize — Role-Based Access Control (RBAC) middleware factory
 *
 * Must be used AFTER the `authenticate` middleware, which sets `req.user`.
 *
 * Usage:
 *   router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
 *   router.post('/donations', authenticate, authorize('donor'), createDonation);
 *
 * @param {...string} roles - One or more allowed roles (e.g. 'admin', 'donor', 'ngo')
 * @returns {Function} Express middleware that enforces role membership
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Guard against using authorize without authenticate
      return next(new ApiError(401, 'Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. This action requires one of the following roles: ${roles.join(', ')}.`
        )
      );
    }

    next();
  };
};

export default authorize;
