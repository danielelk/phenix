const db = require("../config/db");
const logger = require("../utils/logger");

/**
 * MembershipRequest model - Handle membership applications for the association
 */
class MembershipRequest {
  /**
   * Create a new membership request
   * @param {Object} requestData - Membership request data
   * @returns {Promise<Object>} Newly created membership request
   */
  static async create(requestData) {
    try {
      const {
        firstName, 
        lastName, 
        email, 
        phone, 
        genre, 
        nationalite,
        formuleId,
        estBenevole,
        inscriptionSport,
        inscriptionLoisirs,
        autorisationImage,
        notes,
        emergencyContactName,
        emergencyContactPhone,
        medicalNotes,
        address,
        city,
        postalCode,
        dateOfBirth,
        billingEmail,
        status = 'pending'
      } = requestData;

      const query = `
        INSERT INTO membership_requests (
          first_name, 
          last_name, 
          email, 
          phone,
          genre,
          nationalite,
          formule_id,
          est_benevole,
          inscription_sport,
          inscription_loisirs,
          autorisation_image,
          emergency_contact_name,
          emergency_contact_phone,
          medical_notes,
          address,
          city,
          postal_code,
          birth_date,
          billing_email,
          notes,
          status,
          registration_date
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) 
        RETURNING *
      `;

      const values = [
        firstName,
        lastName,
        email,
        phone,
        genre,
        nationalite,
        formuleId,
        estBenevole !== undefined ? estBenevole : false,
        inscriptionSport !== undefined ? inscriptionSport : false,
        inscriptionLoisirs !== undefined ? inscriptionLoisirs : false,
        autorisationImage !== undefined ? autorisationImage : false,
        emergencyContactName,
        emergencyContactPhone,
        medicalNotes || null,
        address || null,
        city || null,
        postalCode || null,
        dateOfBirth,
        billingEmail || email,
        notes || null,
        status,
        new Date()
      ];

      const { rows } = await db.query(query, values);

      return rows[0];
    } catch (error) {
      logger.error("Error creating membership request:", error);
      throw error;
    }
  }

  /**
   * Find membership request by ID
   * @param {number} id - Membership request ID
   * @returns {Promise<Object|null>} Membership request object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT mr.*, f.titre as formule_titre, f.prix as formule_prix 
        FROM membership_requests mr
        LEFT JOIN formules f ON mr.formule_id = f.id
        WHERE mr.id = $1
      `;
      const { rows } = await db.query(query, [id]);

      return rows[0] || null;
    } catch (error) {
      logger.error(`Error finding membership request with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Find membership request by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} Membership request object or null
   */
  static async findByEmail(email) {
    try {
      const query = `
        SELECT * FROM membership_requests
        WHERE email = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const { rows } = await db.query(query, [email]);

      return rows[0] || null;
    } catch (error) {
      logger.error(`Error finding membership request by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Get all membership requests
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of membership requests
   */
  static async findAll(options = {}) {
    try {
      const { status, sortBy = 'created_at', sortOrder = 'DESC' } = options;

      let whereClause = '';
      const params = [];

      if (status) {
        params.push(status);
        whereClause = ` WHERE status = $${params.length}`;
      }

      const query = `
        SELECT mr.*, f.titre as formule_titre, f.prix as formule_prix 
        FROM membership_requests mr
        LEFT JOIN formules f ON mr.formule_id = f.id
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
      `;

      const { rows } = await db.query(query, params);

      return rows;
    } catch (error) {
      logger.error("Error finding all membership requests:", error);
      throw error;
    }
  }

  /**
   * Update membership request
   * @param {number} id - Membership request ID
   * @param {Object} requestData - Membership request data to update
   * @returns {Promise<Object>} Updated membership request
   */
  static async update(id, requestData) {
    try {
      const allowedFields = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "genre",
        "nationalite",
        "formule_id",
        "est_benevole",
        "inscription_sport",
        "inscription_loisirs",
        "autorisation_image",
        "emergency_contact_name",
        "emergency_contact_phone",
        "medical_notes",
        "address",
        "city",
        "postal_code",
        "birth_date",
        "billing_email",
        "notes",
        "status"
      ];

      // Build SET clause for update
      const updates = [];
      const values = [];

      Object.keys(requestData).forEach((key) => {
        // Convert camelCase to snake_case for DB
        const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();

        if (allowedFields.includes(dbField)) {
          values.push(requestData[key]);
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
        UPDATE membership_requests 
        SET ${updates.join(", ")} 
        WHERE id = $${values.length} 
        RETURNING *
      `;

      const { rows } = await db.query(query, values);

      if (rows.length === 0) {
        throw new Error("Membership request not found");
      }

      return rows[0];
    } catch (error) {
      logger.error(`Error updating membership request with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete membership request
   * @param {number} id - Membership request ID
   * @returns {Promise<boolean>} Success flag
   */
  static async delete(id) {
    try {
      const query = "DELETE FROM membership_requests WHERE id = $1 RETURNING id";
      const { rows } = await db.query(query, [id]);

      return rows.length > 0;
    } catch (error) {
      logger.error(`Error deleting membership request with ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = { MembershipRequest };