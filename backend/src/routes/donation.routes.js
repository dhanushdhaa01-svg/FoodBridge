import { Router } from 'express';
import donationController from '../controllers/donation.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';
import requireApproval from '../middleware/requireApproval.js';

const router = Router();

// ─── POST /api/v1/donations ───────────────────────────────────────────────────
// Create a new food donation.
// Requires authenticated donor account.

router.post('/', authenticate, authorize('donor'), donationController.createDonation);

// ─── GET /api/v1/donations ───────────────────────────────────────────────────
// Browse available donations for NGOs.
// Requires authenticated and approved NGO account.

router.get('/', authenticate, authorize('ngo'), requireApproval, donationController.listAvailableDonations);

// ─── GET /api/v1/donations/my ────────────────────────────────────────────────
// Get authenticated donor's donation history.
// Requires authenticated donor account.

router.get('/my', authenticate, authorize('donor'), donationController.listDonorDonations);

// ─── GET /api/v1/donations/my-claims ─────────────────────────────────────────
// Get authenticated NGO's claim history.
// Requires authenticated and approved NGO account.

router.get('/my-claims', authenticate, authorize('ngo'), requireApproval, donationController.listNgoClaims);

// ─── GET /api/v1/donations/all ───────────────────────────────────────────────
// Get all platform donations for admin oversight.
// Requires authenticated admin account.

router.get('/all', authenticate, authorize('admin'), donationController.listAllDonations);

// ─── GET /api/v1/donations/:id ───────────────────────────────────────────────
// Get a single donation by ID.
// Requires authentication. Service enforces role-based visibility.

router.get('/:id', authenticate, donationController.getDonationById);

// ─── POST /api/v1/donations/:id/claim ───────────────────────────────────────
// Claim an available donation.
// Requires authenticated and approved NGO account.

router.post('/:id/claim', authenticate, authorize('ngo'), requireApproval, donationController.claimDonation);

// ─── POST /api/v1/donations/:id/cancel-claim ─────────────────────────────────
// Cancel an NGO's claim on a donation.
// Requires authenticated and approved NGO account.

router.post('/:id/cancel-claim', authenticate, authorize('ngo'), requireApproval, donationController.cancelClaim);

// ─── POST /api/v1/donations/:id/complete ────────────────────────────────────
// Mark a claimed donation as completed.
// Requires authenticated and approved NGO account.

router.post('/:id/complete', authenticate, authorize('ngo'), requireApproval, donationController.completeDonation);

// ─── POST /api/v1/donations/:id/cancel ──────────────────────────────────────
// Cancel a donation.
// Requires authentication. Service enforces donor/admin authorization.

router.post('/:id/cancel', authenticate, donationController.cancelDonation);

export default router;
