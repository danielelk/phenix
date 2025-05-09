const db = require("../config/db");
const logger = require("../utils/logger");
const { Activity } = require("./Activity");
const {
  addWeeks,
  addMonths,
  format,
  parse,
  isAfter,
  isBefore,
  startOfDay,
} = require("date-fns");

class RecurringActivity {
  /**
   * Create a new recurring activity
   * @param {Object} activityData - Recurring activity data
   * @returns {Promise<Object>} Newly created recurring activity
   */
  static async create(activityData) {
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
      createdBy,
    } = activityData;

    // Insert recurring activity into database
    const query = `
      INSERT INTO recurring_activities (
        title, 
        description, 
        location,
        day_of_week,
        start_time,
        end_time,
        recurrence_type,
        start_date,
        end_date,
        type, 
        max_participants,
        transport_available,
        transport_capacity,
        is_paid,
        price,
        created_by
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING *
    `;
    const toIntOrNull = (val) =>
      val === "" || val === undefined ? null : parseInt(val, 10);
    const toBool = (val) => val === "true" || val === true;

    const values = [
      title,
      description,
      location,
      toIntOrNull(dayOfWeek),
      startTime,
      endTime,
      recurrenceType,
      startDate,
      endDate || null,
      type,
      toIntOrNull(maxParticipants),
      toBool(transportAvailable),
      toIntOrNull(transportCapacity),
      toBool(isPaid),
      isPaid ? toIntOrNull(price) || 0 : 0,
      toIntOrNull(createdBy),
    ];

    const { rows } = await db.query(query, values);

    // Generate activity instances
    await this.generateInstances(rows[0].id);

    return rows[0];
  }

  /**
   * Find recurring activity by ID
   * @param {number} id - Recurring activity ID
   * @returns {Promise<Object|null>} Recurring activity object or null
   */
  static async findById(id) {
    const query = "SELECT * FROM recurring_activities WHERE id = $1";
    const { rows } = await db.query(query, [id]);

    return rows[0] || null;
  }

  /**
   * Get all recurring activities
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Recurring activities and count
   */
  static async findAll(options = {}) {
    const { sortBy = "created_at", sortOrder = "DESC" } = options;

    const query = `
      SELECT * FROM recurring_activities
      ORDER BY ${sortBy} ${sortOrder}
    `;

    const { rows } = await db.query(query);

    return rows;
  }

  /**
   * Update recurring activity
   * @param {number} id - Recurring activity ID
   * @param {Object} activityData - Recurring activity data to update
   * @param {boolean} regenerateInstances - Whether to regenerate future instances
   * @returns {Promise<Object>} Updated recurring activity
   */
  static async update(id, activityData, regenerateInstances = true) {
    const allowedFields = [
      "title",
      "description",
      "location",
      "day_of_week",
      "start_time",
      "end_time",
      "recurrence_type",
      "start_date",
      "end_date",
      "type",
      "max_participants",
      "transport_available",
      "transport_capacity",
      "is_paid",
      "price",
    ];

    // Build SET clause for update
    const updates = [];
    const values = [];

    Object.keys(activityData).forEach((key) => {
      // Convert camelCase to snake_case for DB
      const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();

      if (allowedFields.includes(dbField)) {
        values.push(activityData[key]);
        updates.push(`${dbField} = $${values.length}`);
      }
    });

    // Add updated_at
    updates.push(`updated_at = NOW()`);

    if (updates.length === 0) {
      throw new Error("No valid fields to update");
    }

    // Add id as the last parameter
    values.push(id);

    const query = `
      UPDATE recurring_activities 
      SET ${updates.join(", ")} 
      WHERE id = $${values.length} 
      RETURNING *
    `;

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      throw new Error("Recurring activity not found");
    }

    // Regenerate future instances if needed
    if (regenerateInstances) {
      // First, delete future instances that haven't happened yet
      const today = new Date();
      const deleteQuery = `
        DELETE FROM activities 
        WHERE recurring_activity_id = $1 
        AND start_date > $2
      `;
      await db.query(deleteQuery, [id, today]);

      // Then generate new instances
      await this.generateInstances(id);
    }

    return rows[0];
  }

  /**
   * Delete recurring activity and all its instances
   * @param {number} id - Recurring activity ID
   * @param {boolean} keepPastInstances - Whether to keep past instances
   * @returns {Promise<boolean>} Success flag
   */
  static async delete(id, keepPastInstances = true) {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      // Delete future instances or all instances
      if (keepPastInstances) {
        const today = new Date();
        await client.query(
          "DELETE FROM activities WHERE recurring_activity_id = $1 AND start_date > $2",
          [id, today]
        );
      } else {
        // Remove recurring_activity_id reference first to avoid FK constraint issues
        await client.query(
          "UPDATE activities SET recurring_activity_id = NULL WHERE recurring_activity_id = $1",
          [id]
        );
      }

      // Delete the recurring activity
      const { rows } = await client.query(
        "DELETE FROM recurring_activities WHERE id = $1 RETURNING id",
        [id]
      );

      await client.query("COMMIT");

      return rows.length > 0;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate activity instances for a recurring activity
   * @param {number} recurringActivityId - Recurring activity ID
   * @param {Date} upToDate - Generate instances up to this date (default: 3 months from now)
   * @returns {Promise<Array>} Generated activity instances
   */
  static async generateInstances(recurringActivityId, upToDate = null) {
    // Default to 3 months from now if no date provided
    if (!upToDate) {
      upToDate = new Date();
      upToDate.setMonth(upToDate.getMonth() + 3);
    }

    // Get the recurring activity
    const recurringActivity = await this.findById(recurringActivityId);
    if (!recurringActivity) {
      throw new Error("Recurring activity not found");
    }

    // Prepare start and end dates
    let currentDate = new Date(recurringActivity.start_date);
    const endDate = recurringActivity.end_date
      ? new Date(recurringActivity.end_date)
      : upToDate;

    // Ensure we don't generate past the end date
    if (isAfter(upToDate, endDate)) {
      upToDate = endDate;
    }

    // Set day of week for the current date
    currentDate.setDate(
      currentDate.getDate() +
        ((recurringActivity.day_of_week - currentDate.getDay() + 7) % 7)
    );

    // Generate instances
    const createdInstances = [];

    while (
      isBefore(currentDate, upToDate) ||
      currentDate.getTime() === upToDate.getTime()
    ) {
      // Create activity instance
      const startTime = recurringActivity.start_time.split(":");
      const endTime = recurringActivity.end_time.split(":");

      const startDate = new Date(currentDate);
      startDate.setHours(
        parseInt(startTime[0], 10),
        parseInt(startTime[1], 10),
        0
      );

      const endDate = new Date(currentDate);
      endDate.setHours(parseInt(endTime[0], 10), parseInt(endTime[1], 10), 0);

      // Check if instance already exists
      const { rows: existingInstances } = await db.query(
        "SELECT id FROM activities WHERE recurring_activity_id = $1 AND start_date = $2",
        [recurringActivityId, startDate]
      );

      if (existingInstances.length === 0) {
        // Create new instance
        const instanceData = {
          title: recurringActivity.title,
          description: recurringActivity.description,
          startDate,
          endDate,
          location: recurringActivity.location,
          type: recurringActivity.type,
          maxParticipants: recurringActivity.max_participants,
          transportAvailable: recurringActivity.transport_available,
          transportCapacity: recurringActivity.transport_capacity,
          isPaid: recurringActivity.is_paid,
          price: recurringActivity.price,
          recurringActivityId: recurringActivityId,
          createdBy: recurringActivity.created_by,
        };

        try {
          const instance = await Activity.create(instanceData);
          createdInstances.push(instance);
        } catch (error) {
          logger.error(`Error creating activity instance: ${error.message}`);
        }
      }

      // Move to next occurrence based on recurrence type
      switch (recurringActivity.recurrence_type) {
        case "weekly":
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case "biweekly":
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case "monthly":
          currentDate.setMonth(currentDate.getMonth() + 1);
          // Adjust to the correct day of week for the new month
          const tempDate = new Date(currentDate);
          tempDate.setDate(1); // Start from the 1st of the month
          // Find first occurrence of the day of week
          tempDate.setDate(
            tempDate.getDate() +
              ((recurringActivity.day_of_week - tempDate.getDay() + 7) % 7)
          );
          // If this is the first week, we need the nth occurrence
          const nthWeek =
            Math.floor(
              (new Date(recurringActivity.start_date).getDate() - 1) / 7
            ) + 1;
          tempDate.setDate(tempDate.getDate() + (nthWeek - 1) * 7);
          currentDate = tempDate;
          break;
        default:
          break;
      }
    }

    return createdInstances;
  }

  /**
   * Get activity instances for a recurring activity
   * @param {number} recurringActivityId - Recurring activity ID
   * @returns {Promise<Array>} Activity instances
   */
  static async getInstances(recurringActivityId) {
    const query = `
      SELECT * FROM activities 
      WHERE recurring_activity_id = $1 
      ORDER BY start_date ASC
    `;

    const { rows } = await db.query(query, [recurringActivityId]);

    return rows;
  }
}

module.exports = RecurringActivity;
