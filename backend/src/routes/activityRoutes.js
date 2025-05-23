const express = require("express");
const {
  getActivities,
  getActivitiesByDateRange,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  addParticipant,
  removeParticipant,
  addAccompagnateur,
  removeAccompagnateur,
} = require("../controllers/activityController");
const {
  startActivity,
  completeActivity,
  savePresence,
  getExpenses,
  addExpense,
  deleteExpense,
} = require("../controllers/activityMobileController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { userRoles } = require("../models/User");

const router = express.Router();

router.use(protect);

router.get("/calendar", getActivitiesByDateRange);

router
  .route("/")
  .get(getActivities)
  .post(restrictTo(userRoles.ADMIN, userRoles.ACCOMPAGNATEUR), createActivity);

router
  .route("/:id")
  .get(getActivityById)
  .patch(restrictTo(userRoles.ADMIN, userRoles.ACCOMPAGNATEUR), updateActivity)
  .delete(restrictTo(userRoles.ADMIN), deleteActivity);

// Mobile endpoints
router.post("/:id/start", restrictTo(userRoles.ACCOMPAGNATEUR), startActivity);
router.post("/:id/complete", restrictTo(userRoles.ACCOMPAGNATEUR), completeActivity);
router.post("/:id/presence", restrictTo(userRoles.ACCOMPAGNATEUR), savePresence);

router
  .route("/:id/expenses")
  .get(getExpenses)
  .post(restrictTo(userRoles.ACCOMPAGNATEUR), addExpense);

router.delete(
  "/:id/expenses/:expenseId",
  restrictTo(userRoles.ACCOMPAGNATEUR),
  deleteExpense
);

router
  .route("/:id/participants")
  .post(restrictTo(userRoles.ADMIN, userRoles.ACCOMPAGNATEUR), addParticipant);

router
  .route("/:id/participants/:userId")
  .delete(
    restrictTo(userRoles.ADMIN, userRoles.ACCOMPAGNATEUR),
    removeParticipant
  );

router
  .route("/:id/accompagnateurs")
  .post(restrictTo(userRoles.ADMIN), addAccompagnateur);

router
  .route("/:id/accompagnateurs/:userId")
  .delete(restrictTo(userRoles.ADMIN), removeAccompagnateur);

module.exports = router;