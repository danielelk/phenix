const { Activity, activityTypes } = require("../models/Activity");
const logger = require("../utils/logger");

/**
 * Get all activities with pagination and filtering
 * @route GET /api/activities
 */
exports.getActivities = async (req, res) => {
  try {
    const { page, limit, type, search, sortBy, sortOrder, upcoming } =
      req.query;

    const result = await Activity.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      type,
      search,
      sortBy,
      sortOrder: sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC",
      upcoming: upcoming === "true",
    });

    res.status(200).json({
      status: "success",
      data: {
        activities: result.activities,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error("Get activities error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting activities",
    });
  }
};

/**
 * Get activities by date range
 * @route GET /api/activities/calendar
 */
exports.getActivitiesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, type, accompagnateurId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "fail",
        message: "Start date and end date are required",
      });
    }

    const activities = await Activity.findByDateRange(
      new Date(startDate),
      new Date(endDate),
      { type, accompagnateurId }
    );

    res.status(200).json({
      status: "success",
      data: {
        activities,
      },
    });
  } catch (error) {
    logger.error("Get activities by date range error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting activities by date range",
    });
  }
};

/**
 * Get activity by ID
 * @route GET /api/activities/:id
 */
exports.getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);

    if (!activity) {
      return res.status(404).json({
        status: "fail",
        message: "Activity not found",
      });
    }

    const participants = await Activity.getParticipants(id);
    const accompagnateurs = await Activity.getAccompagnateurs(id);

    res.status(200).json({
      status: "success",
      data: {
        activity,
        participants,
        accompagnateurs,
      },
    });
  } catch (error) {
    logger.error("Get activity by ID error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting activity",
    });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      type,
      maxParticipants,
      transportAvailable,
      transportCapacity,
      isPaid,
      price,
    } = req.body;

    // Validate activity type
    if (!Object.values(activityTypes).includes(type)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid activity type",
      });
    }

    // Create new activity
    const newActivity = await Activity.create({
      title,
      description,
      startDate,
      endDate,
      location,
      type,
      maxParticipants: maxParticipants || null,
      transportAvailable: transportAvailable || false,
      transportCapacity: transportAvailable ? transportCapacity || 0 : 0,
      isPaid: isPaid || false,
      price: isPaid ? price || 0 : 0,
      createdBy: req.user.id,
    });

    // Send response
    res.status(201).json({
      status: "success",
      data: {
        activity: newActivity,
      },
    });
  } catch (error) {
    logger.error("Create activity error:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating activity",
    });
  }
};

// And update the updateActivity function

exports.updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      type,
      maxParticipants,
      transportAvailable,
      transportCapacity,
      isPaid,
      price,
    } = req.body;

    // Check if activity exists
    const existingActivity = await Activity.findById(id);

    if (!existingActivity) {
      return res.status(404).json({
        status: "fail",
        message: "Activity not found",
      });
    }

    // Validate activity type if provided
    if (type && !Object.values(activityTypes).includes(type)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid activity type",
      });
    }

    // Update activity
    const updatedActivity = await Activity.update(id, {
      title,
      description,
      startDate,
      endDate,
      location,
      type,
      maxParticipants,
      transportAvailable,
      transportCapacity,
      isPaid,
      price,
    });

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        activity: updatedActivity,
      },
    });
  } catch (error) {
    logger.error("Update activity error:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating activity",
    });
  }
};

/**
 * Delete activity
 * @route DELETE /api/activities/:id
 */
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const existingActivity = await Activity.findById(id);

    if (!existingActivity) {
      return res.status(404).json({
        status: "fail",
        message: "Activity not found",
      });
    }

    const deleted = await Activity.delete(id);

    if (!deleted) {
      return res.status(500).json({
        status: "error",
        message: "Failed to delete activity",
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error("Delete activity error:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting activity",
    });
  }
};

/**
 * Add participant to activity
 * @route POST /api/activities/:id/participants
 */
exports.addParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, needsTransport } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "fail",
        message: "User ID is required",
      });
    }

    const participant = await Activity.addParticipant(
      id,
      userId,
      needsTransport || false
    );

    res.status(201).json({
      status: "success",
      data: {
        participant,
      },
    });
  } catch (error) {
    logger.error("Add participant error:", error);
    res.status(400).json({
      status: "fail",
      message: error.message || "Error adding participant",
    });
  }
};

/**
 * Remove participant from activity
 * @route DELETE /api/activities/:id/participants/:userId
 */
exports.removeParticipant = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const removed = await Activity.removeParticipant(id, userId);

    if (!removed) {
      return res.status(404).json({
        status: "fail",
        message: "Participant not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error("Remove participant error:", error);
    res.status(500).json({
      status: "error",
      message: "Error removing participant",
    });
  }
};

/**
 * Add accompagnateur to activity
 * @route POST /api/activities/:id/accompagnateurs
 */
exports.addAccompagnateur = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "fail",
        message: "User ID is required",
      });
    }

    const accompagnateur = await Activity.addAccompagnateur(id, userId);

    res.status(201).json({
      status: "success",
      data: {
        accompagnateur,
      },
    });
  } catch (error) {
    logger.error("Add accompagnateur error:", error);
    res.status(400).json({
      status: "fail",
      message: error.message || "Error adding accompagnateur",
    });
  }
};

/**
 * Remove accompagnateur from activity
 * @route DELETE /api/activities/:id/accompagnateurs/:userId
 */
exports.removeAccompagnateur = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const removed = await Activity.removeAccompagnateur(id, userId);

    if (!removed) {
      return res.status(404).json({
        status: "fail",
        message: "Accompagnateur not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error("Remove accompagnateur error:", error);
    res.status(500).json({
      status: "error",
      message: "Error removing accompagnateur",
    });
  }
};
