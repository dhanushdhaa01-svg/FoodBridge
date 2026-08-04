import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generates a signed JWT access token for a given user ID.
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {string} Signed JWT string
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId.toString() }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// ─── Service Methods ──────────────────────────────────────────────────────────

/**
 * Registers a new user account.
 *
 * Business rules enforced here:
 * - Duplicate email check before creation (more informative than relying on
 *   MongoDB's duplicate key error alone, though the DB constraint is kept as
 *   a safety net).
 * - Passwords are hashed with bcrypt (12 salt rounds) before storage.
 * - Donors are auto-approved (`isApproved: true`).
 * - NGOs start as pending (`isApproved: false`) and require admin review.
 *
 * @param {Object} dto - Data transfer object from the request body
 * @returns {{ user: Object, token: string }}
 * @throws {ApiError} 409 if email already exists
 */
const registerUser = async (dto) => {
  const {
    fullName,
    email,
    password,
    phone,
    role,
    organizationName,
    address,
    city,
    state,
    pincode,
  } = dto;

  // Pre-check for duplicate email to return a clear 409 before hitting DB unique index
  const existingUser = await User.findOne({ email: email?.toLowerCase()?.trim() });
  if (existingUser) {
    throw new ApiError(
      409,
      'An account with this email address already exists. Please login or use a different email.'
    );
  }

  // Hash password — never store plaintext
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

  // Donors are auto-approved; NGOs await admin verification
  const isApproved = role === 'donor';

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    phone,
    role,
    organizationName: organizationName || undefined,
    address,
    city,
    state,
    pincode,
    isApproved,
  });

  const token = generateAccessToken(user._id);

  // toJSON() strips password and __v via the model's transform function
  return { user: user.toJSON(), token };
};

/**
 * Authenticates a user with email and password.
 *
 * Security notes:
 * - Returns the SAME generic error message for wrong email OR wrong password
 *   to prevent user enumeration attacks.
 * - Uses bcrypt.compare for timing-safe password comparison.
 *
 * @param {string} email
 * @param {string} password - Plaintext password from the request
 * @returns {{ user: Object, token: string }}
 * @throws {ApiError} 401 if credentials are invalid or account is deactivated
 */
const loginUser = async (email, password) => {
  // Must explicitly select password since it's `select: false` in the schema
  const user = await User.findOne({ email: email?.toLowerCase()?.trim() }).select('+password');

  // Use the same error message for both "not found" and "wrong password"
  // to prevent user enumeration (timing difference is mitigated by bcrypt.compare)
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(
      401,
      'Your account has been deactivated. Please contact support for assistance.'
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateAccessToken(user._id);

  // toJSON() removes the password field before returning
  return { user: user.toJSON(), token };
};

/**
 * Retrieves a user by their MongoDB ObjectId.
 * Used by the /me endpoint after the authenticate middleware has verified the token.
 *
 * @param {string} id - MongoDB ObjectId string
 * @returns {Object} User document (transformed via toJSON)
 * @throws {ApiError} 404 if user not found
 */
const getUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return user.toJSON();
};

const authService = { registerUser, loginUser, getUserById };
export default authService;
