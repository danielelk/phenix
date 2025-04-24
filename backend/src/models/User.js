const db = require("../config/db");
const bcrypt = require("bcryptjs");

const userRoles = {
  ADMIN: "admin", // Bureau Restreint (BR)
  ACCOMPAGNATEUR: "accompagnateur",
  ADHERENT: "adherent",
  BENEVOLE: "benevole",
};

class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Newly created user
   */
  static async create(userData) {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
      isVehiculed,
    } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user into database
    const query = `
      INSERT INTO users (
        first_name, 
        last_name, 
        email, 
        password, 
        role, 
        phone, 
        emergency_contact_name,
        emergency_contact_phone,
        medical_notes,
        is_vehiculed
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING id, first_name, last_name, email, role, phone, emergency_contact_name, emergency_contact_phone, created_at
    `;

    const values = [
      firstName,
      lastName,
      email,
      hashedPassword,
      role,
      phone || null,
      emergencyContactName || null,
      emergencyContactPhone || null,
      medicalNotes || null,
      isVehiculed || false,
    ];

    const { rows } = await db.query(query, values);

    return rows[0];
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const { rows } = await db.query(query, [email]);

    console.log("Query result:", rows);

    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(id) {
    const query = "SELECT * FROM users WHERE id = $1";
    const { rows } = await db.query(query, [id]);

    return rows[0] || null;
  }

  /**
   * Get all users (with pagination and filtering)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users and count
   */
  static async findAll(options = {}) {
    const {
      limit = 10,
      page = 1,
      role,
      search,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = options;

    const offset = (page - 1) * limit;

    // Build WHERE clause for filtering
    let whereClause = "";
    const params = [];

    if (role) {
      params.push(role);
      whereClause += `role = $${params.length}`;
    }

    if (search) {
      if (params.length) whereClause += " AND ";
      params.push(`%${search}%`);
      whereClause += `(first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    // Add WHERE if any filters are applied
    whereClause = whereClause ? `WHERE ${whereClause}` : "";

    // Count total matching records
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const { rows: countRows } = await db.query(countQuery, params);
    const totalCount = parseInt(countRows[0].count, 10);

    // Get paginated results
    const query = `
      SELECT id, first_name, last_name, email, role, phone, created_at, updated_at 
      FROM users 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const finalParams = [...params, limit, offset];
    const { rows } = await db.query(query, finalParams);

    return {
      users: rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Update user data
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  static async update(id, userData) {
    const allowedFields = ["first_name", "last_name", "email", "phone", "role"];

    // Build SET clause for update
    const updates = [];
    const values = [];

    Object.keys(userData).forEach((key) => {
      // Convert camelCase to snake_case for DB
      const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();

      if (allowedFields.includes(dbField)) {
        values.push(userData[key]);
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
      UPDATE users 
      SET ${updates.join(", ")} 
      WHERE id = $${values.length} 
      RETURNING id, first_name, last_name, email, role, phone, created_at, updated_at
    `;

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      throw new Error("User not found");
    }

    return rows[0];
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success flag
   */
  static async delete(id) {
    const query = "DELETE FROM users WHERE id = $1 RETURNING id";
    const { rows } = await db.query(query, [id]);

    return rows.length > 0;
  }

  /**
   * Compare password with stored hash
   * @param {string} candidatePassword - Password to check
   * @param {string} userPassword - Stored hashed password
   * @returns {Promise<boolean>} Is password correct
   */
  static async correctPassword(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }
}

module.exports = {
  User,
  userRoles,
};
