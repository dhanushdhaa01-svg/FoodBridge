import donationService from '../services/donation.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Donation Controller
 *
 * Thin HTTP layer responsible for:
 * 1. Extracting data from the request (params, body, query)
 * 2. Passing the authenticated user context to the service
 * 3. Returning standardized ApiResponse objects
 *
 * No business logic lives here.
 */

// ─── POST /api/v1/donations ───────────────────────────────────────────────────

const createDonation = asyncHandler(async (req, res) => {
  const donationData = req.body;

  const donation = await donationService.createDonation(req.user._id.toString(), donationData);

  res.status(201).json(
    new ApiResponse(201, 'Donation created successfully.', { donation })
  );
});

// ─── GET /api/v1/donations/:id ───────────────────────────────────────────────

const getDonationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const donation = await donationService.getDonationById(id, {
    id: req.user._id,
    role: req.user.role
  });

  res.status(200).json(
    new ApiResponse(200, 'Donation fetched successfully.', { donation })
  );
});

// ─── GET /api/v1/donations ───────────────────────────────────────────────────

const listAvailableDonations = asyncHandler(async (req, res) => {
  const { city, foodType, quantityUnit, page, limit } = req.query;

  const result = await donationService.listAvailableDonations(
    { city, foodType, quantityUnit },
    { page, limit }
  );

  res.status(200).json(
    new ApiResponse(200, 'Available donations fetched successfully.', result)
  );
});

// ─── GET /api/v1/donations/my ────────────────────────────────────────────────

const listDonorDonations = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;

  const result = await donationService.listDonorDonations(
    req.user._id.toString(),
    { status },
    { page, limit }
  );

  res.status(200).json(
    new ApiResponse(200, 'Your donations fetched successfully.', result)
  );
});

// ─── POST /api/v1/donations/:id/claim ───────────────────────────────────────

const claimDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const donation = await donationService.claimDonation(id, req.user._id.toString());

  res.status(200).json(
    new ApiResponse(200, 'Donation claimed successfully.', { donation })
  );
});

// ─── POST /api/v1/donations/:id/cancel-claim ─────────────────────────────────

const cancelClaim = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const donation = await donationService.cancelClaim(id, req.user._id.toString());

  res.status(200).json(
    new ApiResponse(200, 'Donation claim cancelled successfully.', { donation })
  );
});

// ─── POST /api/v1/donations/:id/complete ────────────────────────────────────

const completeDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const donation = await donationService.completeDonation(id, req.user._id.toString());

  res.status(200).json(
    new ApiResponse(200, 'Donation completed successfully.', { donation })
  );
});

// ─── POST /api/v1/donations/:id/cancel ──────────────────────────────────────

const cancelDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cancellationReason } = req.body;

  const donation = await donationService.cancelDonation(
    id,
    { id: req.user._id, role: req.user.role },
    cancellationReason
  );

  res.status(200).json(
    new ApiResponse(200, 'Donation cancelled successfully.', { donation })
  );
});

// ─── GET /api/v1/donations/my-claims ─────────────────────────────────────────

const listNgoClaims = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;

  const result = await donationService.listNgoClaims(
    req.user._id.toString(),
    { status },
    { page, limit }
  );

  res.status(200).json(
    new ApiResponse(200, 'Your claimed donations fetched successfully.', result)
  );
});

// ─── GET /api/v1/donations/all ───────────────────────────────────────────────

const listAllDonations = asyncHandler(async (req, res) => {
  const { status, city, foodType, page, limit } = req.query;

  const result = await donationService.listAllDonations(
    { status, city, foodType },
    { page, limit }
  );

  res.status(200).json(
    new ApiResponse(200, 'All donations fetched successfully.', result)
  );
});

const donationController = {
  createDonation,
  getDonationById,
  listAvailableDonations,
  listDonorDonations,
  listNgoClaims,
  listAllDonations,
  claimDonation,
  cancelClaim,
  completeDonation,
  cancelDonation
};

export default donationController;
