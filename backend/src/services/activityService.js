const { Activity } = require("../models/Activity");
const logger = require("../utils/logger");

/**
 * Activity service - Contains business logic related to activities
 */
class ActivityService {
  /**
   * Get all activities with filtering and pagination
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Activities and pagination info
   */
  async getAllActivities(options = {}) {
    try {
      return await Activity.findAll(options);
    } catch (error) {
      logger.error("Error getting activities:", error);
      throw error;
    }
  }

  /**
   * Get activities by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Activities in date range
   */
  async getActivitiesByDateRange(startDate, endDate, options = {}) {
    try {
      return await Activity.findByDateRange(startDate, endDate, options);
    } catch (error) {
      logger.error("Error getting activities by date range:", error);
      throw error;
    }
  }

  /**
   * Get activity by ID with participants and accompagnateurs
   * @param {number} id - Activity ID
   * @returns {Promise<Object>} Activity with participants and accompagnateurs
   */
  async getActivityById(id) {
    try {
      const activity = await Activity.findById(id);
      if (!activity) {
        throw new Error("Activity not found");
      }

      const participants = await Activity.getParticipants(id);
      const accompagnateurs = await Activity.getAccompagnateurs(id);

      return {
        activity,
        participants,
        accompagnateurs,
      };
    } catch (error) {
      logger.error(`Error getting activity with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new activity
   * @param {Object} activityData - Activity data
   * @param {number} userId - ID of user creating the activity
   * @returns {Promise<Object>} Created activity
   */
  async createActivity(activityData, userId) {
    try {
      return await Activity.create({
        ...activityData,
        createdBy: userId,
      });
    } catch (error) {
      logger.error("Error creating activity:", error);
      throw error;
    }
  }

  /**
   * Update activity data
   * @param {number} id - Activity ID
   * @param {Object} activityData - Activity data to update
   * @returns {Promise<Object>} Updated activity
   */
  async updateActivity(id, activityData) {
    try {
      // Check if activity exists
      const activity = await Activity.findById(id);
      if (!activity) {
        throw new Error("Activity not found");
      }

      return await Activity.update(id, activityData);
    } catch (error) {
      logger.error(`Error updating activity with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an activity
   * @param {number} id - Activity ID
   * @returns {Promise<boolean>} Success flag
   */
  async deleteActivity(id) {
    try {
      // Check if activity exists
      const activity = await Activity.findById(id);
      if (!activity) {
        throw new Error("Activity not found");
      }

      return await Activity.delete(id);
    } catch (error) {
      logger.error(`Error deleting activity with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add participant to activity
   * @param {number} activityId - Activity ID
   * @param {number} userId - User ID
   * @param {boolean} needsTransport - Whether participant needs transport
   * @returns {Promise<Object>} Participant data
   */
  async addParticipant(activityId, userId, needsTransport = false) {
    try {
      return await Activity.addParticipant(activityId, userId, needsTransport);
    } catch (error) {
      logger.error(
        `Error adding participant to activity ${activityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Remove participant from activity
   * @param {number} activityId - Activity ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success flag
   */
  async removeParticipant(activityId, userId) {
    try {
      return await Activity.removeParticipant(activityId, userId);
    } catch (error) {
      logger.error(
        `Error removing participant from activity ${activityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Add accompagnateur to activity
   * @param {number} activityId - Activity ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Accompagnateur data
   */
  async addAccompagnateur(activityId, userId) {
    try {
      return await Activity.addAccompagnateur(activityId, userId);
    } catch (error) {
      logger.error(
        `Error adding accompagnateur to activity ${activityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Remove accompagnateur from activity
   * @param {number} activityId - Activity ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} Success flag
   */
  async removeAccompagnateur(activityId, userId) {
    try {
      return await Activity.removeAccompagnateur(activityId, userId);
    } catch (error) {
      logger.error(
        `Error removing accompagnateur from activity ${activityId}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = new ActivityService();
