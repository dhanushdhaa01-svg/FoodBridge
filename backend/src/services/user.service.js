import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const getPendingNgoApprovals = async () => {
  const users = await User.find({ role: 'ngo', isApproved: false }).sort({ createdAt: -1 });

  return users.map(user => {
    const safeUser = user.toJSON();
    delete safeUser.password;
    safeUser.id = safeUser.id.toString();
    return safeUser;
  });
};

const approveNgo = async (adminUserId, ngoUserId) => {
  if (!adminUserId || !ngoUserId) {
    throw new ApiError(400, 'Invalid user IDs provided.');
  }

  if (adminUserId.toString() === ngoUserId.toString()) {
    throw new ApiError(400, 'Admin cannot modify their own account through this endpoint.');
  }

  const targetUser = await User.findById(ngoUserId);

  if (!targetUser) {
    throw new ApiError(404, 'User not found.');
  }

  if (targetUser.role !== 'ngo') {
    throw new ApiError(400, 'Only NGO accounts can be approved through this endpoint.');
  }

  if (targetUser.isApproved) {
    throw new ApiError(400, 'This NGO has already been approved.');
  }

  const updatedUser = await User.findByIdAndUpdate(
    ngoUserId,
    { $set: { isApproved: true } },
    { new: true }
  );

  const safeUser = updatedUser.toJSON();
  delete safeUser.password;
  safeUser.id = safeUser.id.toString();

  return safeUser;
};

const getUserProfile = async (userId) => {
  if (!userId) {
    throw new ApiError(400, 'User ID is required.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return user.toJSON();
};

const updateUserProfile = async (userId, updateData) => {
  if (!userId) {
    throw new ApiError(400, 'User ID is required.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const allowedFields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode', 'organizationName'];
  const updatePayload = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updatePayload[field] = typeof updateData[field] === 'string' ? updateData[field].trim() : updateData[field];
    }
  }

  // Validate phone if provided
  if (updatePayload.phone) {
    if (!/^[6-9]\d{9}$/.test(updatePayload.phone)) {
      throw new ApiError(400, 'Please provide a valid 10-digit Indian phone number.');
    }
  }

  // Validate pincode if provided
  if (updatePayload.pincode) {
    if (!/^[1-9][0-9]{5}$/.test(updatePayload.pincode)) {
      throw new ApiError(400, 'Please provide a valid 6-digit pincode.');
    }
  }

  // If user is NGO, organizationName cannot be empty
  if (user.role === 'ngo' && updatePayload.organizationName !== undefined && !updatePayload.organizationName) {
    throw new ApiError(400, 'Organization name is required for NGO accounts.');
  }

  // Prevent editing protected fields
  delete updatePayload.role;
  delete updatePayload.email;
  delete updatePayload.password;
  delete updatePayload.isApproved;
  delete updatePayload.isActive;
  delete updatePayload._id;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  return updatedUser.toJSON();
};

const getAllUsers = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.role && ['donor', 'ngo', 'admin'].includes(query.role)) {
    filter.role = query.role;
  }

  if (query.isApproved !== undefined) {
    filter.isApproved = query.isApproved === 'true' || query.isApproved === true;
  }

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { organizationName: searchRegex },
      { city: searchRegex }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  return {
    users: users.map(u => u.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const userService = {
  getPendingNgoApprovals,
  approveNgo,
  getUserProfile,
  updateUserProfile,
  getAllUsers
};

export default userService;
