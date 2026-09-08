import asyncHandler from '../utils/asyncHandler.js';
import userService from '../services/user.service.js';
import ApiResponse from '../utils/ApiResponse.js';

const getPendingNgoApprovals = asyncHandler(async (req, res) => {
  const users = await userService.getPendingNgoApprovals();

  res.status(200).json(
    new ApiResponse(200, 'Pending NGO approvals retrieved successfully.', { users })
  );
});

const approveNgo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user._id;

  const user = await userService.approveNgo(adminUserId, id);

  res.status(200).json(
    new ApiResponse(200, 'NGO approved successfully.', { user })
  );
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user._id);

  res.status(200).json(
    new ApiResponse(200, 'User profile retrieved successfully.', { user })
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUserProfile(req.user._id, req.body);

  res.status(200).json(
    new ApiResponse(200, 'Profile updated successfully.', { user: updatedUser })
  );
});

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);

  res.status(200).json(
    new ApiResponse(200, 'Users retrieved successfully.', result)
  );
});

const userController = {
  getPendingNgoApprovals,
  approveNgo,
  getProfile,
  updateProfile,
  getAllUsers
};

export default userController;
