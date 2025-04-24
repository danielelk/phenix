const { User, userRoles } = require("../models/User");
const logger = require("../utils/logger");
const db = require("../config/db");

/**
 * Get all users with pagination and filtering
 * @route GET /api/users
 */
exports.getUsers = async (req, res) => {
  try {
    const { page, limit, role, search, sortBy, sortOrder } = req.query;

    // Get users with pagination
    const result = await User.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      role,
      search,
      sortBy,
      sortOrder: sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC",
    });

    // Get stats (count of users by role)
    const statsQuery = `
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;

    const { rows: statsRows } = await db.query(statsQuery);

    // Convert to a more accessible format
    const stats = {
      admins: 0,
      accompagnateurs: 0,
      adherents: 0,
      benevoles: 0,
      total: 0,
    };

    statsRows.forEach((row) => {
      stats[row.role + "s"] = parseInt(row.count, 10);
      stats.total += parseInt(row.count, 10);
    });

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        users: result.users,
        stats,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error("Get users error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting users",
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    delete user.password;

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error("Get user by ID error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting user",
    });
  }
};

/**
 * Create a new user
 * @route POST /api/users
 */
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already in use",
      });
    }

    if (!Object.values(userRoles).includes(role)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid role",
      });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
    });

    delete newUser.password;

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    logger.error("Create user error:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating user",
    });
  }
};

/**
 * Update user
 * @route PATCH /api/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, role } = req.body;

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (email && email !== existingUser.email) {
      const userWithEmail = await User.findByEmail(email);

      if (userWithEmail && userWithEmail.id !== parseInt(id)) {
        return res.status(400).json({
          status: "fail",
          message: "Email already in use",
        });
      }
    }

    if (role && !Object.values(userRoles).includes(role)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid role",
      });
    }

    const updatedUser = await User.update(id, {
      firstName,
      lastName,
      email,
      phone,
      role,
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    logger.error("Update user error:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating user",
    });
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const deleted = await User.delete(id);

    if (!deleted) {
      return res.status(500).json({
        status: "error",
        message: "Failed to delete user",
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error("Delete user error:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting user",
    });
  }
};

/**
 * Get accompagnateurs
 * @route GET /api/users/accompagnateurs
 */
exports.getAccompagnateurs = async (req, res) => {
  try {
    const result = await User.findAll({
      role: userRoles.ACCOMPAGNATEUR,
      sortBy: "last_name",
      sortOrder: "ASC",
    });

    res.status(200).json({
      status: "success",
      data: {
        accompagnateurs: result.users,
      },
    });
  } catch (error) {
    logger.error("Get accompagnateurs error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting accompagnateurs",
    });
  }
};

/**
 * Get adherents
 * @route GET /api/users/adherents
 */
exports.getAdherents = async (req, res) => {
  try {
    const result = await User.findAll({
      role: userRoles.ADHERENT,
      sortBy: "last_name",
      sortOrder: "ASC",
    });

    res.status(200).json({
      status: "success",
      data: {
        adherents: result.users,
      },
    });
  } catch (error) {
    logger.error("Get adherents error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting adherents",
    });
  }
};
