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
  static async create(activityData) {
    const client = await db.getClient();
    
    try {
      await client.query("BEGIN");

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
        defaultParticipants = [],
        defaultAccompagnateurs = [],
      } = activityData;

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

      const { rows } = await client.query(query, values);
      const recurringActivity = rows[0];

      // Add default participants
      if (defaultParticipants.length > 0) {
        const participantValues = defaultParticipants.map((userId, index) => {
          const paramOffset = index * 2;
          return `($${paramOffset + 1}, $${paramOffset + 2})`;
        }).join(', ');

        const participantParams = defaultParticipants.flatMap(userId => [
          recurringActivity.id,
          userId
        ]);

        await client.query(`
          INSERT INTO recurring_activity_participants (recurring_activity_id, user_id)
          VALUES ${participantValues}
        `, participantParams);
      }

      // Add default accompagnateurs
      if (defaultAccompagnateurs.length > 0) {
        const accompagnateurValues = defaultAccompagnateurs.map((userId, index) => {
          const paramOffset = index * 2;
          return `($${paramOffset + 1}, $${paramOffset + 2})`;
        }).join(', ');

        const accompagnateurParams = defaultAccompagnateurs.flatMap(userId => [
          recurringActivity.id,
          userId
        ]);

        await client.query(`
          INSERT INTO recurring_activity_accompagnateurs (recurring_activity_id, user_id)
          VALUES ${accompagnateurValues}
        `, accompagnateurParams);
      }

      await client.query("COMMIT");

      // Generate activity instances
      await this.generateInstances(recurringActivity.id);

      return recurringActivity;
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Error creating recurring activity:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const query = `
      SELECT ra.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pu.id,
              'first_name', pu.first_name,
              'last_name', pu.last_name,
              'email', pu.email
            )
          ) FILTER (WHERE pu.id IS NOT NULL), 
          '[]'
        ) as default_participants,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', au.id,
              'first_name', au.first_name,
              'last_name', au.last_name,
              'email', au.email
            )
          ) FILTER (WHERE au.id IS NOT NULL), 
          '[]'
        ) as default_accompagnateurs
      FROM recurring_activities ra
      LEFT JOIN recurring_activity_participants rap ON ra.id = rap.recurring_activity_id
      LEFT JOIN users pu ON rap.user_id = pu.id
      LEFT JOIN recurring_activity_accompagnateurs raa ON ra.id = raa.recurring_activity_id
      LEFT JOIN users au ON raa.user_id = au.id
      WHERE ra.id = $1
      GROUP BY ra.id
    `;
    
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  static async findAll(options = {}) {
    const { sortBy = "created_at", sortOrder = "DESC" } = options;

    const query = `
      SELECT ra.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pu.id,
              'first_name', pu.first_name,
              'last_name', pu.last_name,
              'email', pu.email
            )
          ) FILTER (WHERE pu.id IS NOT NULL), 
          '[]'
        ) as default_participants,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', au.id,
              'first_name', au.first_name,
              'last_name', au.last_name,
              'email', au.email
            )
          ) FILTER (WHERE au.id IS NOT NULL), 
          '[]'
        ) as default_accompagnateurs
      FROM recurring_activities ra
      LEFT JOIN recurring_activity_participants rap ON ra.id = rap.recurring_activity_id
      LEFT JOIN users pu ON rap.user_id = pu.id
      LEFT JOIN recurring_activity_accompagnateurs raa ON ra.id = raa.recurring_activity_id
      LEFT JOIN users au ON raa.user_id = au.id
      GROUP BY ra.id
      ORDER BY ${sortBy} ${sortOrder}
    `;

    const { rows } = await db.query(query);
    return rows;
  }

  static async update(id, activityData, regenerateInstances = true) {
    const client = await db.getClient();
    
    try {
      await client.query("BEGIN");

      const {
        defaultParticipants = [],
        defaultAccompagnateurs = [],
        ...updateData
      } = activityData;

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

      const updates = [];
      const values = [];

      Object.keys(updateData).forEach((key) => {
        const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();

        if (allowedFields.includes(dbField)) {
          values.push(updateData[key]);
          updates.push(`${dbField} = $${values.length}`);
        }
      });

      updates.push(`updated_at = NOW()`);

      if (updates.length > 0) {
        values.push(id);

        const query = `
          UPDATE recurring_activities 
          SET ${updates.join(", ")} 
          WHERE id = $${values.length} 
          RETURNING *
        `;

        const { rows } = await client.query(query, values);

        if (rows.length === 0) {
          throw new Error("Recurring activity not found");
        }
      }

      // Update default participants
      await client.query(
        "DELETE FROM recurring_activity_participants WHERE recurring_activity_id = $1",
        [id]
      );

      if (defaultParticipants.length > 0) {
        const participantValues = defaultParticipants.map((userId, index) => {
          const paramOffset = index * 2;
          return `($${paramOffset + 1}, $${paramOffset + 2})`;
        }).join(', ');

        const participantParams = defaultParticipants.flatMap(userId => [id, userId]);

        await client.query(`
          INSERT INTO recurring_activity_participants (recurring_activity_id, user_id)
          VALUES ${participantValues}
        `, participantParams);
      }

      // Update default accompagnateurs
      await client.query(
        "DELETE FROM recurring_activity_accompagnateurs WHERE recurring_activity_id = $1",
        [id]
      );

      if (defaultAccompagnateurs.length > 0) {
        const accompagnateurValues = defaultAccompagnateurs.map((userId, index) => {
          const paramOffset = index * 2;
          return `($${paramOffset + 1}, $${paramOffset + 2})`;
        }).join(', ');

        const accompagnateurParams = defaultAccompagnateurs.flatMap(userId => [id, userId]);

        await client.query(`
          INSERT INTO recurring_activity_accompagnateurs (recurring_activity_id, user_id)
          VALUES ${accompagnateurValues}
        `, accompagnateurParams);
      }

      await client.query("COMMIT");

      // Regenerate future instances if needed
      if (regenerateInstances) {
        const today = new Date();
        const deleteQuery = `
          DELETE FROM activities 
          WHERE recurring_activity_id = $1 
          AND start_date > $2
        `;
        await db.query(deleteQuery, [id, today]);

        await this.generateInstances(id);
      }

      return await this.findById(id);
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Error updating recurring activity:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id, keepPastInstances = true) {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      if (keepPastInstances) {
        const today = new Date();
        await client.query(
          "DELETE FROM activities WHERE recurring_activity_id = $1 AND start_date > $2",
          [id, today]
        );
      } else {
        await client.query(
          "UPDATE activities SET recurring_activity_id = NULL WHERE recurring_activity_id = $1",
          [id]
        );
      }

      // Delete default participants and accompagnateurs
      await client.query(
        "DELETE FROM recurring_activity_participants WHERE recurring_activity_id = $1",
        [id]
      );
      
      await client.query(
        "DELETE FROM recurring_activity_accompagnateurs WHERE recurring_activity_id = $1",
        [id]
      );

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

  static async generateInstances(recurringActivityId, upToDate = null) {
    if (!upToDate) {
      upToDate = new Date();
      upToDate.setMonth(upToDate.getMonth() + 3);
    }

    const recurringActivity = await this.findById(recurringActivityId);
    if (!recurringActivity) {
      throw new Error("Recurring activity not found");
    }

    let currentDate = new Date(recurringActivity.start_date);
    const endDate = recurringActivity.end_date
      ? new Date(recurringActivity.end_date)
      : upToDate;

    if (isAfter(upToDate, endDate)) {
      upToDate = endDate;
    }

    currentDate.setDate(
      currentDate.getDate() +
        ((recurringActivity.day_of_week - currentDate.getDay() + 7) % 7)
    );

    const createdInstances = [];
    const defaultParticipants = recurringActivity.default_participants || [];
    const defaultAccompagnateurs = recurringActivity.default_accompagnateurs || [];

    while (
      isBefore(currentDate, upToDate) ||
      currentDate.getTime() === upToDate.getTime()
    ) {
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

      const { rows: existingInstances } = await db.query(
        "SELECT id FROM activities WHERE recurring_activity_id = $1 AND start_date = $2",
        [recurringActivityId, startDate]
      );

      if (existingInstances.length === 0) {
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
          
          // Add default participants to this instance
          for (const participant of defaultParticipants) {
            try {
              await Activity.addParticipant(instance.id, participant.id, false);
            } catch (error) {
              logger.warn(`Failed to add participant ${participant.id} to activity instance ${instance.id}: ${error.message}`);
            }
          }

          // Add default accompagnateurs to this instance
          for (const accompagnateur of defaultAccompagnateurs) {
            try {
              await Activity.addAccompagnateur(instance.id, accompagnateur.id);
            } catch (error) {
              logger.warn(`Failed to add accompagnateur ${accompagnateur.id} to activity instance ${instance.id}: ${error.message}`);
            }
          }

          createdInstances.push(instance);
        } catch (error) {
          logger.error(`Error creating activity instance: ${error.message}`);
        }
      }

      switch (recurringActivity.recurrence_type) {
        case "weekly":
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case "biweekly":
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case "monthly":
          currentDate.setMonth(currentDate.getMonth() + 1);
          const tempDate = new Date(currentDate);
          tempDate.setDate(1);
          tempDate.setDate(
            tempDate.getDate() +
              ((recurringActivity.day_of_week - tempDate.getDay() + 7) % 7)
          );
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