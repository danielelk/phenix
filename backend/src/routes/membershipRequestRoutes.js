const express = require("express");
const { 
  getMembershipRequests, 
  getMembershipRequestById, 
  createMembershipRequest, 
  updateMembershipRequest, 
  deleteMembershipRequest,
  approveMembershipRequest, // Ajouté cette fonction
  rejectMembershipRequest   // Ajouté cette fonction
} = require("../controllers/membershipRequestController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { userRoles } = require("../models/User");

const router = express.Router();

// Routes publiques
router.post("/", createMembershipRequest);

// Routes protégées
router.use(protect);

// Routes pour administrateurs seulement
router.get("/", restrictTo(userRoles.ADMIN), getMembershipRequests);
router.get("/:id", restrictTo(userRoles.ADMIN), getMembershipRequestById);
router.patch("/:id", restrictTo(userRoles.ADMIN), updateMembershipRequest);
router.delete("/:id", restrictTo(userRoles.ADMIN), deleteMembershipRequest);

// Routes pour approuver/rejeter les demandes
router.post("/:id/approve", restrictTo(userRoles.ADMIN), approveMembershipRequest);
router.post("/:id/reject", restrictTo(userRoles.ADMIN), rejectMembershipRequest);

module.exports = router;