const db = require("../config/db");
const logger = require("../utils/logger");

/**
 * Adherent model - extends User model with adherent-specific functionality
 */
class Adherent {
  /**
   * Get all adherents with additional adherent-specific info
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Adherents and pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        limit = 10,
        page = 1,
        search,
        sortBy = "last_name",
        sortOrder = "ASC",
      } = options;

      const offset = (page - 1) * limit;

      // Build WHERE clause for filtering
      let whereClause = "WHERE role = $1";
      const params = ["adherent"];

      if (search) {
        params.push(`%${search}%`);
        whereClause += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
      }

      // Count total matching records
      const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
      const { rows: countRows } = await db.query(countQuery, params);
      const totalCount = parseInt(countRows[0].count, 10);

      // Get paginated results with additional adherent info
      const query = `
        SELECT 
          u.id, 
          u.first_name, 
          u.last_name, 
          u.email, 
          u.phone, 
          u.emergency_contact_name,
          u.emergency_contact_phone,
          u.medical_notes,
          u.is_vehiculed,
          u.created_at,
          u.updated_at
        FROM users u
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      const finalParams = [...params, limit, offset];
      const { rows } = await db.query(query, finalParams);

      return {
        adherents: rows,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      logger.error("Error finding adherents:", error);
      throw error;
    }
  }

  /**
   * Get adherent by ID with all adherent-specific information
   * @param {number} id - Adherent ID
   * @returns {Promise<Object|null>} Adherent with details
   */
  static async findById(id) {
    try {
      const query = `
        SELECT 
          u.id, 
          u.first_name, 
          u.last_name, 
          u.email, 
          u.phone, 
          u.emergency_contact_name,
          u.emergency_contact_phone,
          u.medical_notes,
          u.is_vehiculed,
          u.created_at,
          u.updated_at
        FROM users u
        WHERE u.id = $1 AND u.role = 'adherent'
      `;

      const { rows } = await db.query(query, [id]);

      return rows[0] || null;
    } catch (error) {
      logger.error("Error finding adherent by ID:", error);
      throw error;
    }
  }

  /**
   * Update adherent-specific information
   * @param {number} id - Adherent ID
   * @param {Object} data - Adherent data to update
   * @returns {Promise<Object>} Updated adherent
   */
  static async update(id, data) {
    try {
      // First, check if user exists and is an adherent
      const checkQuery = `
        SELECT id FROM users 
        WHERE id = $1 AND role = 'adherent'
      `;

      const { rows: checkResult } = await db.query(checkQuery, [id]);

      if (checkResult.length === 0) {
        throw new Error("Adherent not found");
      }

      // Build SET clause for adherent-specific fields
      const allowedFields = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "emergency_contact_name",
        "emergency_contact_phone",
        "medical_notes",
        "is_vehiculed",
      ];

      const updates = [];
      const values = [];

      Object.keys(data).forEach((key) => {
        // Convert camelCase to snake_case for DB
        const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();

        if (allowedFields.includes(dbField)) {
          values.push(data[key]);
          updates.push(`${dbField} = $${values.length}`);
        }
      });

      if (updates.length === 0) {
        throw new Error("No valid fields to update");
      }

      // Add updated_at and id
      updates.push(`updated_at = NOW()`);
      values.push(id);

      const updateQuery = `
        UPDATE users 
        SET ${updates.join(", ")} 
        WHERE id = $${values.length} AND role = 'adherent'
        RETURNING 
          id, 
          first_name, 
          last_name, 
          email, 
          phone, 
          emergency_contact_name,
          emergency_contact_phone,
          medical_notes,
          is_vehiculed,
          created_at,
          updated_at
      `;

      const { rows } = await db.query(updateQuery, values);

      if (rows.length === 0) {
        throw new Error("Update failed");
      }

      return rows[0];
    } catch (error) {
      logger.error("Error updating adherent:", error);
      throw error;
    }
  }

  /**
   * Get adherent's upcoming activities
   * @param {number} id - Adherent ID
   * @returns {Promise<Array>} Upcoming activities
   */
  static async getUpcomingActivities(id) {
    try {
      const query = `
        SELECT 
          a.id,
          a.title,
          a.description,
          a.start_date,
          a.end_date,
          a.location,
          a.type,
          ap.needs_transport,
          (
            SELECT COUNT(*) 
            FROM activity_participants 
            WHERE activity_id = a.id
          ) as participant_count,
          a.max_participants
        FROM activities a
        JOIN activity_participants ap ON a.id = ap.activity_id
        WHERE ap.user_id = $1 AND a.start_date >= NOW()
        ORDER BY a.start_date ASC
      `;

      const { rows } = await db.query(query, [id]);

      return rows;
    } catch (error) {
      logger.error("Error getting adherent upcoming activities:", error);
      throw error;
    }
  }

  /**
   * Get adherent's past activities
   * @param {number} id - Adherent ID
   * @returns {Promise<Array>} Past activities
   */
  static async getPastActivities(id) {
    try {
      const query = `
        SELECT 
          a.id,
          a.title,
          a.description,
          a.start_date,
          a.end_date,
          a.location,
          a.type,
          ap.needs_transport
        FROM activities a
        JOIN activity_participants ap ON a.id = ap.activity_id
        WHERE ap.user_id = $1 AND a.end_date < NOW()
        ORDER BY a.start_date DESC
      `;

      const { rows } = await db.query(query, [id]);

      return rows;
    } catch (error) {
      logger.error("Error getting adherent past activities:", error);
      throw error;
    }
  }

  /**
   * Create new adherent (specialized user creation)
   * @param {Object} data - Adherent data
   * @returns {Promise<Object>} Created adherent
   */
  static async create(data) {
    try {
      const client = await db.getClient();

      try {
        await client.query("BEGIN");

        const insertUserQuery = `
          INSERT INTO users (
            first_name, 
            last_name, 
            email, 
            password, 
            phone, 
            role,
            emergency_contact_name,
            emergency_contact_phone,
            medical_notes,
            is_vehiculed
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
          RETURNING 
            id, 
            first_name, 
            last_name, 
            email, 
            phone, 
            emergency_contact_name,
            emergency_contact_phone,
            medical_notes,
            is_vehiculed,
            created_at,
            updated_at
        `;

        const userValues = [
          data.firstName,
          data.lastName,
          data.email,
          data.password,
          data.phone || null,
          "adherent",
          data.emergencyContactName || null,
          data.emergencyContactPhone || null,
          data.medicalNotes || null,
          data.isVehiculed || false,
        ];

        const {
          rows: [adherent],
        } = await client.query(insertUserQuery, userValues);

        await client.query("COMMIT");

        return adherent;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error("Error creating adherent:", error);
      throw error;
    }
  }
}

module.exports = Adherent;
