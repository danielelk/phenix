const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAccompagnateurs,
  getAdherents,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { userRoles } = require("../models/User");

const router = express.Router();

router.use(protect);

const restrictToAdmin = restrictTo(userRoles.ADMIN);

router.get("/accompagnateurs", getAccompagnateurs);
router.get("/adherents", getAdherents);

router.route("/").get(getUsers).post(restrictToAdmin, createUser);

router
  .route("/:id")
  .get(getUserById)
  .patch(restrictToAdmin, updateUser)
  .delete(restrictToAdmin, deleteUser);

module.exports = router;
