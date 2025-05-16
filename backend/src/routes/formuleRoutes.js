const express = require("express");
const {
  getFormules,
  getFormuleById,
  createFormule,
  updateFormule,
  deleteFormule,
  getPublicFormules,
} = require("../controllers/formuleController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { userRoles } = require("../models/User");

const router = express.Router();

// Public route for formules
router.get("/public", getPublicFormules);

// Protected routes for admins
router.use(protect);
router.use(restrictTo(userRoles.ADMIN));

router.route("/")
  .get(getFormules)
  .post(createFormule);

router.route("/:id")
  .get(getFormuleById)
  .patch(updateFormule)
  .delete(deleteFormule);

module.exports = router;