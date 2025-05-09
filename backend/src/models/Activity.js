const db = require("../config/db");

const activityTypes = {
  WITH_ADHERENTS: "with_adherents", // Activities with adherents
  WITHOUT_ADHERENTS: "without_adherents", // Activities without adherents (internal meetings, etc.)
};

class Activity {
  static async create(activityData) {
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
      recurringActivityId, // New field
      createdBy,
    } = activityData;

    // Insert activity into database
    const query = `
      INSERT INTO activities (
        title, 
        description, 
        start_date, 
        end_date, 
        location, 
        type, 
        max_participants,
        transport_available,
        transport_capacity,
        is_paid,
        price,
        recurring_activity_id, 
        created_by
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *
    `;

    const values = [
      title,
      description,
      startDate,
      endDate,
      location,
      type,
      maxParticipants,
      transportAvailable,
      transportCapacity,
      isPaid || false,
      isPaid ? price || 0 : 0,
      recurringActivityId || null,
      createdBy,
    ];

    const { rows } = await db.query(query, values);

    return rows[0];
  }

  static async findById(id) {
    const query = "SELECT * FROM activities WHERE id = $1";
    const { rows } = await db.query(query, [id]);

    return rows[0] || null;
  }

  static async findByDateRange(startDate, endDate, options = {}) {
    const { type, accompagnateurId } = options;

    let query = `
      SELECT a.*, 
        (SELECT COUNT(*) FROM activity_participants WHERE activity_id = a.id) as participant_count
      FROM activities a
      WHERE (a.start_date BETWEEN $1 AND $2 OR a.end_date BETWEEN $1 AND $2)
    `;

    const params = [startDate, endDate];

    if (type) {
      params.push(type);
      query += ` AND a.type = $${params.length}`;
    }

    if (accompagnateurId) {
      params.push(accompagnateurId);
      query += ` AND (a.created_by = $${params.length} OR EXISTS (SELECT 1 FROM activity_accompagnateurs WHERE activity_id = a.id AND user_id = $${params.length}))`;
    }

    query += " ORDER BY a.start_date ASC";

    const { rows } = await db.query(query, params);

    return rows;
  }

  static async findAll(options = {}) {
    const {
      limit = 10,
      page = 1,
      type,
      search,
      sortBy = "start_date",
      sortOrder = "ASC",
      upcoming = false,
    } = options;

    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];

    if (type) {
      params.push(type);
      whereClause += `type = $${params.length}`;
    }

    if (upcoming) {
      if (params.length) whereClause += " AND ";
      params.push(new Date());
      whereClause += `start_date >= $${params.length}`;
    }

    if (search) {
      if (params.length) whereClause += " AND ";
      params.push(`%${search}%`);
      whereClause += `(title ILIKE $${params.length} OR description ILIKE $${params.length} OR location ILIKE $${params.length})`;
    }

    whereClause = whereClause ? `WHERE ${whereClause}` : "";

    const countQuery = `SELECT COUNT(*) FROM activities ${whereClause}`;
    const { rows: countRows } = await db.query(countQuery, params);
    const totalCount = parseInt(countRows[0].count, 10);

    const query = `
      SELECT 
        a.*,
        (SELECT COUNT(*) FROM activity_participants WHERE activity_id = a.id) as participant_count
      FROM activities a 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const finalParams = [...params, limit, offset];
    const { rows } = await db.query(query, finalParams);

    return {
      activities: rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async update(id, activityData) {
    const allowedFields = [
      "title",
      "description",
      "start_date",
      "end_date",
      "location",
      "type",
      "max_participants",
      "transport_available",
      "transport_capacity",
      "is_paid",
      "price",
    ];

    const updates = [];
    const values = [];

    Object.keys(activityData).forEach((key) => {
      const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();

      if (allowedFields.includes(dbField)) {
        values.push(activityData[key]);
        updates.push(`${dbField} = $${values.length}`);
      }
    });

    updates.push(`updated_at = NOW()`);

    if (updates.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);

    const query = `
      UPDATE activities 
      SET ${updates.join(", ")} 
      WHERE id = $${values.length} 
      RETURNING *
    `;

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      throw new Error("Activity not found");
    }

    return rows[0];
  }

  static async delete(id) {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      await client.query(
        "DELETE FROM activity_participants WHERE activity_id = $1",
        [id]
      );

      await client.query(
        "DELETE FROM activity_accompagnateurs WHERE activity_id = $1",
        [id]
      );

      const { rows } = await client.query(
        "DELETE FROM activities WHERE id = $1 RETURNING id",
        [id]
      );

      await client.query("COMMIT");

      return rows.length > 0;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async addParticipant(activityId, userId, needsTransport = false) {
    const checkQuery =
      "SELECT * FROM activity_participants WHERE activity_id = $1 AND user_id = $2";
    const { rows: checkRows } = await db.query(checkQuery, [
      activityId,
      userId,
    ]);

    if (checkRows.length > 0) {
      throw new Error("User is already a participant of this activity");
    }

    // Check if activity exists and has space
    const activityQuery = `
      SELECT 
        a.*,
        (SELECT COUNT(*) FROM activity_participants WHERE activity_id = a.id) as participant_count
      FROM activities a 
      WHERE a.id = $1
    `;

    const { rows: activityRows } = await db.query(activityQuery, [activityId]);

    if (activityRows.length === 0) {
      throw new Error("Activity not found");
    }

    const activity = activityRows[0];

    if (
      activity.max_participants &&
      activity.participant_count >= activity.max_participants
    ) {
      throw new Error("Activity is already at maximum capacity");
    }

    // Add participant
    const insertQuery = `
      INSERT INTO activity_participants (activity_id, user_id, needs_transport) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;

    const { rows } = await db.query(insertQuery, [
      activityId,
      userId,
      needsTransport,
    ]);

    return rows[0];
  }

  /**
   * Remove participant from activity
   * @param {number} activityId - Activity ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success flag
   */
  static async removeParticipant(activityId, userId) {
    const query =
      "DELETE FROM activity_participants WHERE activity_id = $1 AND user_id = $2 RETURNING id";
    const { rows } = await db.query(query, [activityId, userId]);

    return rows.length > 0;
  }

  /**
   * Get participants for an activity
   * @param {number} activityId - Activity ID
   * @returns {Promise<Array>} Participants
   */
  static async getParticipants(activityId) {
    const query = `
      SELECT 
        u.id, 
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        ap.needs_transport,
        ap.created_at as joined_at
      FROM activity_participants ap
      JOIN users u ON ap.user_id = u.id
      WHERE ap.activity_id = $1
      ORDER BY u.last_name, u.first_name
    `;

    const { rows } = await db.query(query, [activityId]);

    return rows;
  }

  /**
   * Add accompagnateur to activity
   * @param {number} activityId - Activity ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Accompagnateur data
   */
  static async addAccompagnateur(activityId, userId) {
    // Check if already an accompagnateur
    const checkQuery =
      "SELECT * FROM activity_accompagnateurs WHERE activity_id = $1 AND user_id = $2";
    const { rows: checkRows } = await db.query(checkQuery, [
      activityId,
      userId,
    ]);

    if (checkRows.length > 0) {
      throw new Error("User is already an accompagnateur of this activity");
    }

    // Check if user is an accompagnateur
    const userQuery = "SELECT * FROM users WHERE id = $1 AND role = $2";
    const { rows: userRows } = await db.query(userQuery, [
      userId,
      "accompagnateur",
    ]);

    if (userRows.length === 0) {
      throw new Error("User is not an accompagnateur");
    }

    // Add accompagnateur
    const insertQuery = `
      INSERT INTO activity_accompagnateurs (activity_id, user_id) 
      VALUES ($1, $2) 
      RETURNING *
    `;

    const { rows } = await db.query(insertQuery, [activityId, userId]);

    return rows[0];
  }

  /**
   * Remove accompagnateur from activity
   * @param {number} activityId - Activity ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success flag
   */
  static async removeAccompagnateur(activityId, userId) {
    const query =
      "DELETE FROM activity_accompagnateurs WHERE activity_id = $1 AND user_id = $2 RETURNING id";
    const { rows } = await db.query(query, [activityId, userId]);

    return rows.length > 0;
  }

  /**
   * Get accompagnateurs for an activity
   * @param {number} activityId - Activity ID
   * @returns {Promise<Array>} Accompagnateurs
   */
  static async getAccompagnateurs(activityId) {
    const query = `
      SELECT 
        u.id, 
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        aa.created_at as assigned_at
      FROM activity_accompagnateurs aa
      JOIN users u ON aa.user_id = u.id
      WHERE aa.activity_id = $1
      ORDER BY u.last_name, u.first_name
    `;

    const { rows } = await db.query(query, [activityId]);

    return rows;
  }
}

module.exports = {
  Activity,
  activityTypes,
};
