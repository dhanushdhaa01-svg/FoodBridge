import authService from '../services/auth.service.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Auth Controller
 *
 * Thin HTTP layer responsible for:
 * 1. Extracting data from the request
 * 2. Basic presence validation (field existence — not format, that's the service/model's job)
 * 3. Calling the appropriate service method
 * 4. Sending the standardized response
 *
 * No business logic lives here.
 */

// ─── POST /api/v1/auth/register ──────────────────────────────────────────────

/**
 * Registers a new donor or NGO account.
 *
 * Request body (all fields required for both roles):
 *   fullName, email, password, phone, role, address, city, state, pincode
 *   + organizationName (required only when role === 'ngo')
 *
 * Response includes `isApproved` in the user object so the client can
 * immediately route NGOs to the "Awaiting Approval" page without an extra API call.
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role, address, city, state, pincode } = req.body;

  // Guard: reject requests missing the absolute minimum fields before hitting the service
  const requiredFields = { fullName, email, password, phone, role, address, city, state, pincode };
  const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => !value)
    .map(([key]) => `'${key}' is required`);

  if (missingFields.length > 0) {
    throw new ApiError(400, 'Missing required fields.', missingFields);
  }

  const { user, token } = await authService.registerUser(req.body);

  res.status(201).json(
    new ApiResponse(201, 'Account created successfully.', { user, token })
  );
});

// ─── POST /api/v1/auth/login ─────────────────────────────────────────────────

/**
 * Authenticates an existing user and returns a JWT.
 *
 * Returns `isApproved` and `role` in the user object so the client can
 * immediately determine post-login routing without additional requests.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const { user, token } = await authService.loginUser(email, password);

  res.status(200).json(
    new ApiResponse(200, 'Logged in successfully.', { user, token })
  );
});

// ─── GET /api/v1/auth/me ─────────────────────────────────────────────────────

/**
 * Returns the currently authenticated user's profile.
 *
 * The `authenticate` middleware has already verified the token and
 * populated `req.user` with the user document before this handler runs.
 * We re-fetch from the service to guarantee fresh data is always returned.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user._id);

  res.status(200).json(
    new ApiResponse(200, 'User profile retrieved successfully.', { user })
  );
});

const authController = { register, login, getMe };
export default authController;
