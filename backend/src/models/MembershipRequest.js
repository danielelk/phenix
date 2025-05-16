const db = require("../config/db");
const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");
const { User, userRoles } = require("./User");

/**
 * Membership Request model - Handle membership requests from public
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
        birthDate,
        address,
        city,
        postalCode,
        emergencyContactName,
        emergencyContactPhone,
        medicalNotes,
        genre,
        nationalite,
        formuleId,
        estBenevole,
        inscriptionSport,
        inscriptionLoisirs,
        autorisationImage,
        registrationDate,
      } = requestData;

      // Insert membership request into database
      const query = `
        INSERT INTO membership_requests (
          first_name, 
          last_name, 
          email, 
          phone, 
          birth_date, 
          address, 
          city, 
          postal_code, 
          emergency_contact_name,
          emergency_contact_phone,
          medical_notes,
          genre,
          nationalite,
          formule_id,
          est_benevole,
          inscription_sport,
          inscription_loisirs,
          autorisation_image,
          registration_date,
          status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) 
        RETURNING *
      `;

      const values = [
        firstName,
        lastName,
        email,
        phone,
        birthDate,
        address || null,
        city || null,
        postalCode || null,
        emergencyContactName,
        emergencyContactPhone,
        medicalNotes || null,
        genre,
        nationalite,
        formuleId,
        estBenevole || false,
        inscriptionSport || false,
        inscriptionLoisirs || false,
        autorisationImage || false,
        registrationDate || new Date(),
        'pending', // Default status
      ];

      const { rows } = await db.query(query, values);

      return rows[0];
    } catch (error) {
      logger.error("Error creating membership request:", error);
      throw error;
    }
  }

  /**
   * Get all membership requests with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Membership requests and count
   */
  static async findAll(options = {}) {
    try {
      const {
        limit = 10,
        page = 1,
        status,
        search,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = options;

      const offset = (page - 1) * limit;

      // Build WHERE clause for filtering
      let whereClause = "";
      const params = [];

      if (status) {
        params.push(status);
        whereClause += `status = $${params.length}`;
      }

      if (search) {
        if (params.length) whereClause += " AND ";
        params.push(`%${search}%`);
        whereClause += `(first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
      }

      // Add WHERE if any filters are applied
      whereClause = whereClause ? `WHERE ${whereClause}` : "";

      // Count total matching records
      const countQuery = `SELECT COUNT(*) FROM membership_requests ${whereClause}`;
      const { rows: countRows } = await db.query(countQuery, params);
      const totalCount = parseInt(countRows[0].count, 10);

      // Get paginated results with formule info
      const query = `
        SELECT mr.*, f.titre as formule_titre, f.prix as formule_prix  
        FROM membership_requests mr
        LEFT JOIN formules f ON mr.formule_id = f.id
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      const finalParams = [...params, limit, offset];
      const { rows } = await db.query(query, finalParams);

      return {
        requests: rows,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      logger.error("Error getting membership requests:", error);
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
   * Update membership request status
   * @param {number} id - Membership request ID
   * @param {string} status - New status (pending, approved, rejected)
   * @param {Object} additionalData - Optional additional data for membership
   * @returns {Promise<Object>} Updated membership request
   */
  static async updateStatus(id, status, additionalData = null) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Update membership request status
      const updateQuery = `
        UPDATE membership_requests
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;

      const { rows } = await client.query(updateQuery, [status, id]);

      if (rows.length === 0) {
        throw new Error("Membership request not found");
      }

      const updatedRequest = rows[0];

      // If approved, create a user and an adherent record
      if (status === 'approved' && additionalData) {
        // Generate a random password for the user
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create user for the adherent/bénévole
        const userRole = updatedRequest.est_benevole ? userRoles.BENEVOLE : userRoles.ADHERENT;
        
        const createUserQuery = `
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
          RETURNING id
        `;

        const userValues = [
          updatedRequest.first_name,
          updatedRequest.last_name,
          updatedRequest.email,
          hashedPassword,
          updatedRequest.phone,
          userRole,
          updatedRequest.emergency_contact_name,
          updatedRequest.emergency_contact_phone,
          updatedRequest.medical_notes || null,
          false // is_vehiculed
        ];

        const { rows: userRows } = await client.query(createUserQuery, userValues);
        const userId = userRows[0].id;
        
        // Get existing adherent or create new one
        const checkAdherentQuery = `
          SELECT id FROM adherents 
          WHERE email = $1
        `;
        
        const { rows: adherentRows } = await client.query(checkAdherentQuery, [updatedRequest.email]);
        
        let adherentId;
        
        // If adherent doesn't exist yet, create one
        if (adherentRows.length === 0) {
          const createAdherentQuery = `
            INSERT INTO adherents (
              first_name,
              last_name,
              email,
              phone,
              birth_date,
              address,
              city,
              postal_code,
              emergency_contact_name,
              emergency_contact_phone,
              medical_notes,
              genre,
              nationalite,
              formule_id,
              est_benevole,
              inscription_sport,
              inscription_loisirs,
              autorisation_image,
              is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING id
          `;

          const adherentValues = [
            updatedRequest.first_name,
            updatedRequest.last_name,
            updatedRequest.email,
            updatedRequest.phone,
            updatedRequest.birth_date,
            updatedRequest.address || null,
            updatedRequest.city || null, 
            updatedRequest.postal_code || null,
            updatedRequest.emergency_contact_name,
            updatedRequest.emergency_contact_phone,
            updatedRequest.medical_notes || null,
            updatedRequest.genre,
            updatedRequest.nationalite,
            updatedRequest.formule_id,
            updatedRequest.est_benevole,
            updatedRequest.inscription_sport,
            updatedRequest.inscription_loisirs,
            updatedRequest.autorisation_image,
            true // is_active
          ];

          const { rows: newAdherentRows } = await client.query(createAdherentQuery, adherentValues);
          adherentId = newAdherentRows[0].id;
        } else {
          adherentId = adherentRows[0].id;
        }

        // Si pas bénévole et que formule existe, créer un membership
        if (!updatedRequest.est_benevole && updatedRequest.formule_id) {
          // Determine end date based on payment frequency defined by admin
          const startDate = new Date();
          let endDate = new Date();
          
          const paymentFrequency = additionalData.paymentFrequency || 'monthly';
          
          switch (paymentFrequency) {
            case 'monthly':
              endDate.setMonth(endDate.getMonth() + 1);
              break;
            case 'quarterly':
              endDate.setMonth(endDate.getMonth() + 3);
              break;
            case 'annual':
              endDate.setFullYear(endDate.getFullYear() + 1);
              break;
            default:
              endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
          }

          const createMembershipQuery = `
            INSERT INTO memberships (
              adherent_id,
              start_date,
              end_date,
              membership_fee,
              payment_status,
              payment_frequency
            )
            VALUES ($1, $2, $3, $4, $5, $6)
          `;

          const membershipValues = [
            adherentId,
            startDate,
            endDate,
            additionalData.membershipFee || 0, // Fee amount
            'pending', // Initial payment status
            paymentFrequency,
          ];

          await client.query(createMembershipQuery, membershipValues);
        }

        // Update membership request with created records
        await client.query(
          `UPDATE membership_requests SET adherent_id = $1, user_id = $2 WHERE id = $3`,
          [adherentId, userId, id]
        );
        
        // Store the generated password to return it
        updatedRequest.generated_password = password;
        updatedRequest.user_id = userId;
        updatedRequest.adherent_id = adherentId;
      }

      await client.query('COMMIT');
      return updatedRequest;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error updating membership request status:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if email already exists in membership requests
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  static async emailExists(email) {
    try {
      const query = `
        SELECT COUNT(*) FROM membership_requests 
        WHERE email = $1 AND status IN ('pending', 'approved')
      `;
      
      const { rows } = await db.query(query, [email]);
      
      return parseInt(rows[0].count, 10) > 0;
    } catch (error) {
      logger.error(`Error checking if email exists:`, error);
      throw error;
    }
  }
}

module.exports = MembershipRequest;