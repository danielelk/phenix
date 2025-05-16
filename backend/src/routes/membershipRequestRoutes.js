const express = require("express");
const {
  createMembershipRequest,
  getMembershipRequests,
  getMembershipRequestById,
  updateMembershipRequestStatus,
} = require("../controllers/membershipRequestController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { userRoles } = require("../models/User");

const router = express.Router();

// Public route for membership requests
router.post("/", createMembershipRequest);

// Protected routes for admins
router.use(protect);
router.use(restrictTo(userRoles.ADMIN));

router.get("/", getMembershipRequests);
router.get("/:id", getMembershipRequestById);
router.patch("/:id/status", updateMembershipRequestStatus);

module.exports = router;