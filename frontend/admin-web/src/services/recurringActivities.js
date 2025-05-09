import api from "./api";

const recurringActivityService = {
  /**
   * Get all recurring activities
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with recurring activities
   */
  getRecurringActivities: async (params = {}) => {
    return await api.get("/recurring-activities", { params });
  },

  /**
   * Get recurring activity by ID with instances
   * @param {string|number} id - Recurring activity ID
   * @returns {Promise} Response with recurring activity and instances
   */
  getRecurringActivityById: async (id) => {
    return await api.get(`/recurring-activities/${id}`);
  },

  /**
   * Create new recurring activity
   * @param {Object} activityData - Recurring activity data
   * @returns {Promise} Response with created recurring activity
   */
  createRecurringActivity: async (activityData) => {
    return await api.post("/recurring-activities", activityData);
  },

  /**
   * Update recurring activity
   * @param {string|number} id - Recurring activity ID
   * @param {Object} activityData - Recurring activity data to update
   * @returns {Promise} Response with updated recurring activity
   */
  updateRecurringActivity: async (id, activityData) => {
    return await api.patch(`/recurring-activities/${id}`, activityData);
  },

  /**
   * Delete recurring activity
   * @param {string|number} id - Recurring activity ID
   * @param {boolean} keepPastInstances - Whether to keep past instances
   * @returns {Promise} Response
   */
  deleteRecurringActivity: async (id, keepPastInstances = true) => {
    return await api.delete(`/recurring-activities/${id}`, {
      params: { keepPastInstances },
    });
  },

  /**
   * Regenerate instances for a recurring activity
   * @param {string|number} id - Recurring activity ID
   * @param {Date} upToDate - Generate instances up to this date
   * @returns {Promise} Response with generated instances
   */
  regenerateInstances: async (id, upToDate = null) => {
    return await api.post(`/recurring-activities/${id}/regenerate`, {
      upToDate: upToDate ? upToDate.toISOString() : null,
    });
  },
};

export default recurringActivityService;
