const db = require("../config/db");
const logger = require("../utils/logger");

/**
 * Formule model - Handle subscription formulas
 */
class Formule {
  /**
   * Create a new formule
   * @param {Object} formuleData - Formule data
   * @returns {Promise<Object>} Newly created formule
   */
  static async create(formuleData) {
    try {
      const { titre, description, prix, estActif } = formuleData;

      // Insert formule into database
      const query = `
        INSERT INTO formules (
          titre, 
          description,
          prix,
          est_actif
        ) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;

      const values = [
        titre,
        description || null,
        prix,
        estActif !== undefined ? estActif : true,
      ];

      const { rows } = await db.query(query, values);

      return rows[0];
    } catch (error) {
      logger.error("Error creating formule:", error);
      throw error;
    }
  }

  /**
   * Find formule by ID
   * @param {number} id - Formule ID
   * @returns {Promise<Object|null>} Formule object or null
   */
  static async findById(id) {
    try {
      const query = "SELECT * FROM formules WHERE id = $1";
      const { rows } = await db.query(query, [id]);

      return rows[0] || null;
    } catch (error) {
      logger.error(`Error finding formule with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all formules
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of formules
   */
  static async findAll(options = {}) {
    try {
      const { activeOnly = true, sortBy = "prix", sortOrder = "ASC" } = options;

      let whereClause = "";
      const params = [];

      if (activeOnly) {
        whereClause = "WHERE est_actif = true";
      }

      const query = `
        SELECT * 
        FROM formules 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
      `;

      const { rows } = await db.query(query, params);

      return rows;
    } catch (error) {
      logger.error("Error finding formules:", error);
      throw error;
    }
  }

  /**
   * Update formule
   * @param {number} id - Formule ID
   * @param {Object} formuleData - Formule data to update
   * @returns {Promise<Object>} Updated formule
   */
  static async update(id, formuleData) {
    try {
      const allowedFields = ["titre", "description", "prix", "est_actif"];
      
      // Build SET clause for update
      const updates = [];
      const values = [];

      Object.keys(formuleData).forEach((key) => {
        // Convert camelCase to snake_case for DB
        const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();

        if (allowedFields.includes(dbField)) {
          values.push(formuleData[key]);
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
        UPDATE formules
        SET ${updates.join(", ")} 
        WHERE id = $${values.length} 
        RETURNING *
      `;

      const { rows } = await db.query(query, values);

      if (rows.length === 0) {
        throw new Error("Formule not found");
      }

      return rows[0];
    } catch (error) {
      logger.error(`Error updating formule with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete formule
   * @param {number} id - Formule ID
   * @returns {Promise<boolean>} Success flag
   */
  static async delete(id) {
    try {
      const query = "DELETE FROM formules WHERE id = $1 RETURNING id";
      const { rows } = await db.query(query, [id]);

      return rows.length > 0;
    } catch (error) {
      logger.error(`Error deleting formule with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get default formules if none exist
   * @returns {Promise<Array>} Default formules
   */
  static async getDefaultFormules() {
    try {
      // Check if any formules exist
      const countQuery = "SELECT COUNT(*) FROM formules";
      const { rows: countResult } = await db.query(countQuery);
      
      if (parseInt(countResult[0].count) > 0) {
        // If formules exist, return all active ones
        return await this.findAll({ activeOnly: true });
      }
      
      // If no formules exist, create default ones
      const defaultFormules = [
        {
          titre: "Formule Standard",
          description: "Accès aux activités régulières de l'association",
          prix: 150.00,
        },
        {
          titre: "Formule Loisirs",
          description: "Accès aux sorties loisirs et événements spéciaux",
          prix: 100.00,
        },
        {
          titre: "Formule Complète",
          description: "Accès à toutes les activités (sport et loisirs)",
          prix: 200.00,
        }
      ];

      // Insert default formules
      const client = await db.getClient();
      try {
        await client.query('BEGIN');
        
        const insertPromises = defaultFormules.map(formule => 
          this.create(formule)
        );
        
        const createdFormules = await Promise.all(insertPromises);
        
        await client.query('COMMIT');
        return createdFormules;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error("Error getting default formules:", error);
      throw error;
    }
  }
}

module.exports = Formule;