import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import dashboardService from '../services/dashboard.service.js';

/**
 * Controller for retrieving real-time role-based dashboard statistics and activity.
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userContext = {
    id: req.user._id.toString(),
    role: req.user.role
  };

  const data = await dashboardService.getStats(userContext);

  res.status(200).json(
    new ApiResponse(200, 'Dashboard statistics retrieved successfully.', data)
  );
});

const dashboardController = {
  getDashboardStats
};

export default dashboardController;
