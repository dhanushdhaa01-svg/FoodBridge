import mongoose from 'mongoose';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NOW = () => new Date();

/**
 * Validates pagination parameters and returns normalized values.
 * @param {Object} pagination
 * @param {number} [pagination.page]
 * @param {number} [pagination.limit]
 * @returns {{ page: number, limit: number }}
 */
const normalizePagination = ({ page, limit } = {}) => {
  const normalizedPage = Math.max(1, parseInt(page, 10) || 1);
  const normalizedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  return { page: normalizedPage, limit: normalizedLimit };
};

/**
 * Verifies that a user exists and is active.
 * @param {string} userId
 * @returns {Promise<Object>} User document
 * @throws {ApiError} 404 if user not found, 403 if inactive
 */
const verifyActiveUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      'Your account has been deactivated. Please contact support for assistance.'
    );
  }

  return user;
};

/**
 * Builds the base available-donation filter.
 * Available = status is 'available' AND not expired (expiryAt > now).
 * @returns {Object} Mongoose filter
 */
const buildAvailableFilter = () => ({
  status: 'available',
  expiryAt: { $gt: NOW() }
});

// ─── Service Methods ──────────────────────────────────────────────────────────

/**
 * Creates a new food donation.
 *
 * @param {string} donorId - MongoDB ObjectId of the authenticated donor
 * @param {Object} donationData - Validated donation payload from the client
 * @returns {Promise<Object>} Created donation document (transformed via toJSON)
 * @throws {ApiError} 404 if donor not found/inactive, 400 for invalid dates
 */
const createDonation = async (donorId, donationData) => {
  const donor = await verifyActiveUser(donorId);

  if (donor.role !== 'donor') {
    throw new ApiError(403, 'Only donors can create donations.');
  }

  if (!donor.state || !donor.state.trim()) {
    throw new ApiError(400, 'Your profile is missing state information. Please update your profile before creating a donation.');
  }

  if (!donor.pincode || !donor.pincode.trim()) {
    throw new ApiError(400, 'Your profile is missing pincode information. Please update your profile before creating a donation.');
  }

  const pickupDate = donationData.date ? new Date(donationData.date) : new Date();
  const preparedAt = new Date(NOW());
  const expiryAt = new Date(preparedAt.getTime() + 24 * 60 * 60 * 1000);

  if (expiryAt <= preparedAt) {
    throw new ApiError(400, 'Expiry time must be after preparation time.');
  }

  if (expiryAt <= NOW()) {
    throw new ApiError(400, 'Expiry time must be in the future.');
  }

  const donation = await Donation.create({
    foodName: donationData.foodName,
    description: donationData.description,
    foodType: donationData.foodType,
    quantity: donationData.quantity,
    quantityUnit: donationData.quantityUnit,
    preparedAt,
    expiryAt,
    pickupDate,
    pickupStartTime: '09:00',
    pickupEndTime: '18:00',
    address: donationData.address,
    city: donationData.city,
    state: donor.state.trim(),
    pincode: donor.pincode.trim(),
    phone: donationData.phone,
    specialInstructions: donationData.specialInstructions || '',
    donor: donorId,
    status: 'available'
  });

  return donation.toJSON();
};

/**
 * Retrieves a single donation by ID with role-based access control.
 *
 * @param {string} donationId - MongoDB ObjectId
 * @param {{ id: string, role: string }} userContext - Authenticated user context
 * @returns {Promise<Object>} Donation document
 * @throws {ApiError} 400 for invalid ID, 404 if not found, 403 if unauthorized
 */
const getDonationById = async (donationId, userContext) => {
  if (!donationId || !mongoose.Types.ObjectId.isValid(donationId)) {
    throw new ApiError(400, `Invalid value '${donationId}' for field 'donationId'.`);
  }

  const donation = await Donation.findById(donationId);

  if (!donation) {
    throw new ApiError(404, 'Donation not found.');
  }

  const { id: userId, role } = userContext;
  const userIdStr = userId.toString();

  if (role === 'donor') {
    if (donation.donor.toString() !== userIdStr) {
      throw new ApiError(403, 'You are not authorized to view this donation.');
    }
  } else if (role === 'ngo') {
    const isClaimedByMe = donation.claimedBy && donation.claimedBy.toString() === userIdStr;
    const isAvailable = donation.status === 'available';

    if (!isAvailable && !isClaimedByMe) {
      throw new ApiError(403, 'You are not authorized to view this donation.');
    }
  }

  // Do not expose donor contact information to NGOs.
  // The Donation document itself does not contain donor PII,
  // but we avoid populating the donor reference for non-admin roles.
  const result = donation.toJSON();

  if (role === 'ngo') {
    delete result.donor;
  }

  return result;
};

/**
 * Lists available donations for NGO browsing.
 *
 * @param {Object} filters - Query filters
 * @param {string} [filters.city]
 * @param {string} [filters.foodType]
 * @param {string} [filters.quantityUnit]
 * @param {Object} pagination - Pagination options
 * @param {number} [pagination.page=1]
 * @param {number} [pagination.limit=10]
 * @returns {Promise<Object>} Paginated donation list
 */
const listAvailableDonations = async (filters = {}, pagination = {}) => {
  const { page, limit } = normalizePagination(pagination);
  const skip = (page - 1) * limit;

  const filter = buildAvailableFilter();

  if (filters.city) {
    filter.city = filters.city;
  }
  if (filters.foodType) {
    filter.foodType = filters.foodType;
  }
  if (filters.quantityUnit) {
    filter.quantityUnit = filters.quantityUnit;
  }

  const [data, total] = await Promise.all([
    Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Donation.countDocuments(filter)
  ]);

  return {
    data: data.map(doc => doc.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Lists donations belonging to a specific donor.
 *
 * @param {string} userId - MongoDB ObjectId of the donor
 * @param {Object} filters - Query filters
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated donation list
 * @throws {ApiError} 404 if donor not found
 */
const listDonorDonations = async (userId, filters = {}, pagination = {}) => {
  await verifyActiveUser(userId);

  const { page, limit } = normalizePagination(pagination);
  const skip = (page - 1) * limit;

  const filter = { donor: userId };

  if (filters.status) {
    filter.status = filters.status;
  }

  const [data, total] = await Promise.all([
    Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Donation.countDocuments(filter)
  ]);

  return {
    data: data.map(doc => doc.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Lists claims belonging to a specific NGO (claimed and/or completed).
 *
 * @param {string} ngoUserId - MongoDB ObjectId of the NGO
 * @param {Object} filters - Query filters
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated donation list
 */
const listNgoClaims = async (ngoUserId, filters = {}, pagination = {}) => {
  const ngo = await verifyActiveUser(ngoUserId);

  if (ngo.role !== 'ngo') {
    throw new ApiError(403, 'Only NGOs can view claimed donations.');
  }

  const { page, limit } = normalizePagination(pagination);
  const skip = (page - 1) * limit;

  const filter = { claimedBy: ngoUserId };

  if (filters.status) {
    filter.status = filters.status;
  }

  const [data, total] = await Promise.all([
    Donation.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Donation.countDocuments(filter)
  ]);

  return {
    data: data.map(doc => {
      const item = doc.toJSON();
      delete item.donor;
      return item;
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Lists all platform donations for admin oversight.
 *
 * @param {Object} filters - Query filters
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated donation list
 */
const listAllDonations = async (filters = {}, pagination = {}) => {
  const { page, limit } = normalizePagination(pagination);
  const skip = (page - 1) * limit;

  const filter = {};

  if (filters.status) {
    filter.status = filters.status;
  }
  if (filters.city) {
    filter.city = filters.city;
  }
  if (filters.foodType) {
    filter.foodType = filters.foodType;
  }

  const [data, total] = await Promise.all([
    Donation.find(filter)
      .populate('donor', 'fullName email phone')
      .populate('claimedBy', 'fullName email organizationName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Donation.countDocuments(filter)
  ]);

  return {
    data: data.map(doc => doc.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Atomically claims an available donation for an NGO.
 * Uses a single findOneAndUpdate operation to prevent double-claiming.
 *
 * @param {string} donationId - MongoDB ObjectId
 * @param {string} ngoUserId - MongoDB ObjectId of the claiming NGO
 * @returns {Promise<Object>} Updated donation document
 * @throws {ApiError} 404 if donation/user not found, 403 if unauthorized, 409 if already claimed
 */
const claimDonation = async (donationId, ngoUserId) => {
  const ngo = await verifyActiveUser(ngoUserId);

  if (ngo.role !== 'ngo') {
    throw new ApiError(403, 'Only NGOs can claim donations.');
  }

  if (!ngo.isApproved) {
    throw new ApiError(403, 'Your account is pending admin approval.');
  }

  const donation = await Donation.findOneAndUpdate(
    {
      _id: donationId,
      status: 'available',
      expiryAt: { $gt: NOW() }
    },
    {
      $set: {
        status: 'claimed',
        claimedBy: ngoUserId,
        claimedAt: NOW()
      }
    },
    { returnDocument: 'after' }
  );

  if (!donation) {
    throw new ApiError(
      409,
      'This donation has already been claimed or is no longer available.'
    );
  }

  return donation.toJSON();
};

/**
 * Atomically cancels an NGO's claim, returning the donation to available status.
 *
 * @param {string} donationId - MongoDB ObjectId
 * @param {string} ngoUserId - MongoDB ObjectId of the NGO
 * @returns {Promise<Object>} Updated donation document
 * @throws {ApiError} 404 if not found, 403 if not the claiming NGO, 409 if not claimed
 */
const cancelClaim = async (donationId, ngoUserId) => {
  const donation = await Donation.findOneAndUpdate(
    {
      _id: donationId,
      status: 'claimed',
      claimedBy: ngoUserId
    },
    {
      $set: {
        status: 'available',
        claimedBy: null,
        claimedAt: null
      }
    },
    { returnDocument: 'after' }
  );

  if (!donation) {
    throw new ApiError(400, 'This donation is not currently claimed by you.');
  }

  return donation.toJSON();
};

/**
 * Marks a claimed donation as completed.
 *
 * @param {string} donationId - MongoDB ObjectId
 * @param {string} ngoUserId - MongoDB ObjectId of the NGO that claimed it
 * @returns {Promise<Object>} Updated donation document
 * @throws {ApiError} 404 if not found, 403 if not the claiming NGO, 409 if not claimed
 */
const completeDonation = async (donationId, ngoUserId) => {
  const donation = await Donation.findOneAndUpdate(
    {
      _id: donationId,
      status: 'claimed',
      claimedBy: ngoUserId
    },
    {
      $set: {
        status: 'completed',
        completedAt: NOW()
      }
    },
    { returnDocument: 'after' }
  );

  if (!donation) {
    throw new ApiError(400, 'This donation is not currently claimed by you.');
  }

  return donation.toJSON();
};

/**
 * Cancels a donation (donor cancels their own available donation, or admin cancels any).
 *
 * @param {string} donationId - MongoDB ObjectId
 * @param {{ id: string, role: string }} userContext - Authenticated user context
 * @param {string} [cancellationReason] - Optional reason for cancellation
 * @returns {Promise<Object>} Updated donation document
 * @throws {ApiError} 404 if not found, 403 if unauthorized, 409 if invalid status
 */
const cancelDonation = async (donationId, userContext, cancellationReason) => {
  const donation = await Donation.findById(donationId);

  if (!donation) {
    throw new ApiError(404, 'Donation not found.');
  }

  const { id: userId, role } = userContext;
  const userIdStr = userId.toString();

  if (role === 'donor') {
    if (donation.donor.toString() !== userIdStr) {
      throw new ApiError(403, 'You are not authorized to cancel this donation.');
    }
  } else if (role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to cancel this donation.');
  }

  if (donation.status !== 'available') {
    throw new ApiError(
      409,
      `Cannot cancel a donation with status '${donation.status}'. Only available donations can be cancelled.`
    );
  }

  const updated = await Donation.findByIdAndUpdate(
    donationId,
    {
      $set: {
        status: 'cancelled',
        ...(cancellationReason ? { cancellationReason } : {})
      }
    },
    { returnDocument: 'after' }
  );

  return updated.toJSON();
};

/**
 * Marks an available donation as expired if its expiryAt has passed.
 * This is a service-level helper, not a background job.
 *
 * @param {Object} donation - Donation document
 * @returns {Promise<Object>|null} Updated donation if expired, otherwise null
 */
const markExpiredIfNeeded = async (donation) => {
  if (donation.status !== 'available') {
    return null;
  }

  if (donation.expiryAt > NOW()) {
    return null;
  }

  const updated = await Donation.findByIdAndUpdate(
    donation._id,
    { $set: { status: 'expired' } },
    { returnDocument: 'after' }
  );

  return updated ? updated.toJSON() : null;
};

const donationService = {
  createDonation,
  getDonationById,
  listAvailableDonations,
  listDonorDonations,
  listNgoClaims,
  listAllDonations,
  claimDonation,
  cancelClaim,
  completeDonation,
  cancelDonation,
  markExpiredIfNeeded
};

export default donationService;
