import ApiError from '../utils/ApiError.js';

/**
 * requireApproval middleware
 *
 * Enforces that the authenticated user's account has been approved by an admin.
 * Must be used AFTER `authenticate` (which sets `req.user`).
 *
 * NGOs register with `isApproved: false` and can log in immediately, but they
 * cannot perform any protected platform actions until an admin approves them.
 * Donors are auto-approved at registration.
 *
 * Usage:
 *   router.post('/claims', authenticate, requireApproval, createClaim);
 *
 * This keeps the approval gate server-side and enforced consistently —
 * the frontend cannot bypass it by skipping the "Awaiting Approval" page.
 */
const requireApproval = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required.'));
  }

  if (!req.user.isApproved) {
    return next(
      new ApiError(
        403,
        'Your account is pending admin approval. You will be notified once approved.'
      )
    );
  }

  next();
};

export default requireApproval;
