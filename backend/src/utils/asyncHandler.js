/**
 * asyncHandler
 *
 * Higher-order function that wraps async Express route handlers.
 * Eliminates the need for try/catch boilerplate in every controller method
 * by catching rejected Promises and forwarding the error to Express's
 * next() function, which routes it to the global error handler.
 *
 * Usage:
 *   router.get('/me', asyncHandler(async (req, res) => {
 *     const user = await User.findById(req.user.id);
 *     res.json(user);
 *   }));
 *
 * @param {Function} requestHandler - An async Express route handler
 * @returns {Function} A wrapped handler that forwards errors to next()
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export default asyncHandler;
