const RecurringActivity = require("../models/RecurringActivity");
const logger = require("../utils/logger");

/**
 * Get all recurring activities
 * @route GET /api/recurring-activities
 */
exports.getRecurringActivities = async (req, res) => {
  try {
    const options = {
      sortBy: req.query.sortBy || "created_at",
      sortOrder: req.query.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC",
    };

    const recurringActivities = await RecurringActivity.findAll(options);

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        recurringActivities,
      },
    });
  } catch (error) {
    logger.error("Get recurring activities error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting recurring activities",
    });
  }
};

/**
 * Get recurring activity by ID with its instances
 * @route GET /api/recurring-activities/:id
 */
exports.getRecurringActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get recurring activity
    const recurringActivity = await RecurringActivity.findById(id);

    if (!recurringActivity) {
      return res.status(404).json({
        status: "fail",
        message: "Recurring activity not found",
      });
    }

    // Get instances
    const instances = await RecurringActivity.getInstances(id);

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        recurringActivity,
        instances,
      },
    });
  } catch (error) {
    logger.error("Get recurring activity by ID error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting recurring activity",
    });
  }
};

/**
 * Create a new recurring activity
 * @route POST /api/recurring-activities
 */
exports.createRecurringActivity = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      dayOfWeek,
      startTime,
      endTime,
      recurrenceType,
      startDate,
      endDate,
      type,
      maxParticipants,
      transportAvailable,
      transportCapacity,
      isPaid,
      price,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !location ||
      dayOfWeek === undefined ||
      !startTime ||
      !endTime ||
      !recurrenceType ||
      !startDate ||
      !type
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Missing required fields",
      });
    }

    // Validate recurrence type
    const validRecurrenceTypes = ["weekly", "biweekly", "monthly"];
    if (!validRecurrenceTypes.includes(recurrenceType)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid recurrence type",
      });
    }

    // Create recurring activity
    const newRecurringActivity = await RecurringActivity.create({
      title,
      description,
      location,
      dayOfWeek,
      startTime,
      endTime,
      recurrenceType,
      startDate,
      endDate,
      type,
      maxParticipants,
      transportAvailable: transportAvailable || false,
      transportCapacity: transportCapacity || 0,
      isPaid: isPaid || false,
      price: price || 0,
      createdBy: req.user.id,
    });

    // Send response
    res.status(201).json({
      status: "success",
      data: {
        recurringActivity: newRecurringActivity,
      },
    });
  } catch (error) {
    logger.error("Create recurring activity error:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating recurring activity",
    });
  }
};

/**
 * Update recurring activity
 * @route PATCH /api/recurring-activities/:id
 */
exports.updateRecurringActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      dayOfWeek,
      startTime,
      endTime,
      recurrenceType,
      startDate,
      endDate,
      type,
      maxParticipants,
      transportAvailable,
      transportCapacity,
      isPaid,
      price,
      regenerateInstances,
    } = req.body;

    // Check if recurring activity exists
    const existingActivity = await RecurringActivity.findById(id);

    if (!existingActivity) {
      return res.status(404).json({
        status: "fail",
        message: "Recurring activity not found",
      });
    }

    // Validate recurrence type if provided
    if (recurrenceType) {
      const validRecurrenceTypes = ["weekly", "biweekly", "monthly"];
      if (!validRecurrenceTypes.includes(recurrenceType)) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid recurrence type",
        });
      }
    }

    // Update recurring activity
    const updatedRecurringActivity = await RecurringActivity.update(
      id,
      {
        title,
        description,
        location,
        dayOfWeek,
        startTime,
        endTime,
        recurrenceType,
        startDate,
        endDate,
        type,
        maxParticipants,
        transportAvailable,
        transportCapacity,
        isPaid,
        price,
      },
      regenerateInstances !== false // Default to true if not specified
    );

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        recurringActivity: updatedRecurringActivity,
      },
    });
  } catch (error) {
    logger.error("Update recurring activity error:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating recurring activity",
    });
  }
};

/**
 * Delete recurring activity
 * @route DELETE /api/recurring-activities/:id
 */
exports.deleteRecurringActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { keepPastInstances } = req.query;

    // Check if recurring activity exists
    const existingActivity = await RecurringActivity.findById(id);

    if (!existingActivity) {
      return res.status(404).json({
        status: "fail",
        message: "Recurring activity not found",
      });
    }

    // Delete recurring activity and its instances
    const deleted = await RecurringActivity.delete(
      id,
      keepPastInstances !== "false" // Default to true if not specified
    );

    if (!deleted) {
      return res.status(500).json({
        status: "error",
        message: "Failed to delete recurring activity",
      });
    }

    // Send response
    res.status(204).send();
  } catch (error) {
    logger.error("Delete recurring activity error:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting recurring activity",
    });
  }
};

/**
 * Regenerate instances for a recurring activity
 * @route POST /api/recurring-activities/:id/regenerate
 */
exports.regenerateInstances = async (req, res) => {
  try {
    const { id } = req.params;
    const { upToDate } = req.body;

    // Check if recurring activity exists
    const existingActivity = await RecurringActivity.findById(id);

    if (!existingActivity) {
      return res.status(404).json({
        status: "fail",
        message: "Recurring activity not found",
      });
    }

    // Parse upToDate if provided
    let parsedUpToDate = null;
    if (upToDate) {
      parsedUpToDate = new Date(upToDate);
      if (isNaN(parsedUpToDate.getTime())) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid date format for upToDate",
        });
      }
    }

    // Delete future instances first
    const today = new Date();
    const deleteQuery = `
      DELETE FROM activities 
      WHERE recurring_activity_id = $1 
      AND start_date > $2
    `;
    await db.query(deleteQuery, [id, today]);

    // Regenerate instances
    const instances = await RecurringActivity.generateInstances(
      id,
      parsedUpToDate
    );

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        instances,
      },
    });
  } catch (error) {
    logger.error("Regenerate instances error:", error);
    res.status(500).json({
      status: "error",
      message: "Error regenerating instances",
    });
  }
};
