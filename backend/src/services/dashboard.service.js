import Donation from '../models/Donation.js';
import User from '../models/User.js';

const NOW = () => new Date();

/**
 * Computes role-specific, real-time dashboard statistics directly from MongoDB.
 * Zero hardcoded or mock data.
 *
 * @param {{ id: string, role: string }} userContext
 * @returns {Promise<Object>} Role-specific stats payload
 */
const getStats = async (userContext) => {
  const { id: userId, role } = userContext;

  if (role === 'donor') {
    const [total, available, claimed, completed, cancelled, recentDonations] = await Promise.all([
      Donation.countDocuments({ donor: userId }),
      Donation.countDocuments({ donor: userId, status: 'available' }),
      Donation.countDocuments({ donor: userId, status: 'claimed' }),
      Donation.countDocuments({ donor: userId, status: 'completed' }),
      Donation.countDocuments({ donor: userId, status: 'cancelled' }),
      Donation.find({ donor: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('foodName foodType quantity quantityUnit status pickupDate createdAt')
    ]);

    // Calculate total quantity of food donated
    const aggregationResult = await Donation.aggregate([
      { $match: { donor: userContext.id, status: { $in: ['available', 'claimed', 'completed'] } } },
      { $group: { _id: null, totalQty: { $sum: '$quantity' } } }
    ]);
    const totalQuantityDonated = aggregationResult[0]?.totalQty || 0;

    return {
      role: 'donor',
      stats: {
        totalDonations: total,
        availableDonations: available,
        claimedDonations: claimed,
        completedDonations: completed,
        cancelledDonations: cancelled,
        totalQuantityDonated
      },
      recentDonations: recentDonations.map(d => d.toJSON())
    };
  }

  if (role === 'ngo') {
    const [available, myActiveClaims, myCompletedClaims, recentClaims] = await Promise.all([
      Donation.countDocuments({ status: 'available', expiryAt: { $gt: NOW() } }),
      Donation.countDocuments({ claimedBy: userId, status: 'claimed' }),
      Donation.countDocuments({ claimedBy: userId, status: 'completed' }),
      Donation.find({ claimedBy: userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('foodName foodType quantity quantityUnit status address city phone pickupDate claimedAt completedAt')
    ]);

    // Calculate total meals rescued
    const aggregationResult = await Donation.aggregate([
      { $match: { claimedBy: userContext.id, status: 'completed' } },
      { $group: { _id: null, totalQty: { $sum: '$quantity' } } }
    ]);
    const totalQuantityRescued = aggregationResult[0]?.totalQty || 0;

    return {
      role: 'ngo',
      stats: {
        availableDonations: available,
        myActiveClaims,
        myCompletedClaims,
        totalQuantityRescued
      },
      recentClaims: recentClaims.map(d => d.toJSON())
    };
  }

  if (role === 'admin') {
    const [
      totalUsers,
      totalDonors,
      totalNgos,
      pendingNgos,
      approvedNgos,
      totalDonations,
      availableDonations,
      claimedDonations,
      completedDonations,
      cancelledDonations,
      recentDonations,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'ngo', isApproved: false }),
      User.countDocuments({ role: 'ngo', isApproved: true }),
      Donation.countDocuments({}),
      Donation.countDocuments({ status: 'available', expiryAt: { $gt: NOW() } }),
      Donation.countDocuments({ status: 'claimed' }),
      Donation.countDocuments({ status: 'completed' }),
      Donation.countDocuments({ status: 'cancelled' }),
      Donation.find({})
        .populate('donor', 'fullName city')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('foodName foodType quantity quantityUnit status city donor createdAt'),
      User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName email role organizationName city isApproved createdAt')
    ]);

    return {
      role: 'admin',
      stats: {
        users: {
          total: totalUsers,
          donors: totalDonors,
          ngos: totalNgos,
          pendingNgos,
          approvedNgos
        },
        donations: {
          total: totalDonations,
          available: availableDonations,
          claimed: claimedDonations,
          completed: completedDonations,
          cancelled: cancelledDonations
        }
      },
      recentDonations: recentDonations.map(d => d.toJSON()),
      recentUsers: recentUsers.map(u => u.toJSON())
    };
  }

  return { role, stats: {} };
};

const dashboardService = { getStats };
export default dashboardService;
