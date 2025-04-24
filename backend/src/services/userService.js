const { User } = require("../models/User");
const logger = require("../utils/logger");

/**
 * User service - Contains business logic related to users
 */
class UserService {
  /**
   * Get all users with filtering and pagination
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Users and pagination info
   */
  async getAllUsers(options = {}) {
    try {
      return await User.findAll(options);
    } catch (error) {
      logger.error("Error getting users:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      logger.error(`Error getting user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error("Email already in use");
      }

      return await User.create(userData);
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Update user data
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, userData) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      if (userData.email && userData.email !== user.email) {
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser && existingUser.id !== parseInt(id)) {
          throw new Error("Email already in use by another user");
        }
      }

      return await User.update(id, userData);
    } catch (error) {
      logger.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} Success flag
   */
  async deleteUser(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      return await User.delete(id);
    } catch (error) {
      logger.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all accompagnateurs
   * @returns {Promise<Array>} List of accompagnateurs
   */
  async getAccompagnateurs() {
    try {
      const result = await User.findAll({
        role: "accompagnateur",
        sortBy: "last_name",
        sortOrder: "ASC",
      });
      return result.users;
    } catch (error) {
      logger.error("Error getting accompagnateurs:", error);
      throw error;
    }
  }

  /**
   * Get all adherents
   * @returns {Promise<Array>} List of adherents
   */
  async getAdherents() {
    try {
      const result = await User.findAll({
        role: "adherent",
        sortBy: "last_name",
        sortOrder: "ASC",
      });
      return result.users;
    } catch (error) {
      logger.error("Error getting adherents:", error);
      throw error;
    }
  }
}

module.exports = new UserService();
