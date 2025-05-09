const express = require("express");
const {
  getRecurringActivities,
  getRecurringActivityById,
  createRecurringActivity,
  updateRecurringActivity,
  deleteRecurringActivity,
  regenerateInstances,
} = require("../controllers/recurringActivityController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { userRoles } = require("../models/User");

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Only admins can manage recurring activities
router
  .route("/")
  .get(getRecurringActivities)
  .post(restrictTo(userRoles.ADMIN), createRecurringActivity);

router
  .route("/:id")
  .get(getRecurringActivityById)
  .patch(restrictTo(userRoles.ADMIN), updateRecurringActivity)
  .delete(restrictTo(userRoles.ADMIN), deleteRecurringActivity);

router.post(
  "/:id/regenerate",
  restrictTo(userRoles.ADMIN),
  regenerateInstances
);

module.exports = router;
