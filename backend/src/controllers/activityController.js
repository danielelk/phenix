const { Activity, activityTypes } = require("../models/Activity");
const logger = require("../utils/logger");

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
    logger.info("Create activity request received:", req.body);

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

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "Title is required",
      });
    }

    if (!startDate) {
      return res.status(400).json({
        status: "fail",
        message: "Start date is required",
      });
    }

    if (!endDate) {
      return res.status(400).json({
        status: "fail",
        message: "End date is required",
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "Location is required",
      });
    }

    if (!Object.values(activityTypes).includes(type)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid activity type",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid date format",
      });
    }

    if (parsedEndDate <= parsedStartDate) {
      return res.status(400).json({
        status: "fail",
        message: "End date must be after start date",
      });
    }

    const activityData = {
      title: title.trim(),
      description: description?.trim() || null,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      location: location.trim(),
      type,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      transportAvailable: Boolean(transportAvailable),
      transportCapacity: transportAvailable ? parseInt(transportCapacity) || 0 : 0,
      isPaid: Boolean(isPaid),
      price: isPaid ? parseFloat(price) || 0 : 0,
      createdBy: req.user.id,
    };

    logger.info("Creating activity with data:", activityData);

    const newActivity = await Activity.create(activityData);

    logger.info("Activity created successfully:", newActivity);

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

    const existingActivity = await Activity.findById(id);

    if (!existingActivity) {
      return res.status(404).json({
        status: "fail",
        message: "Activity not found",
      });
    }

    if (type && !Object.values(activityTypes).includes(type)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid activity type",
      });
    }

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (parsedEndDate <= parsedStartDate) {
        return res.status(400).json({
          status: "fail",
          message: "End date must be after start date",
        });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (location !== undefined) updateData.location = location;
    if (type !== undefined) updateData.type = type;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants ? parseInt(maxParticipants) : null;
    if (transportAvailable !== undefined) updateData.transportAvailable = Boolean(transportAvailable);
    if (transportCapacity !== undefined) updateData.transportCapacity = parseInt(transportCapacity) || 0;
    if (isPaid !== undefined) updateData.isPaid = Boolean(isPaid);
    if (price !== undefined) updateData.price = parseFloat(price) || 0;

    const updatedActivity = await Activity.update(id, updateData);

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