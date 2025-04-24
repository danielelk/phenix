import api from "./api";

const activityService = {
  /**
   * Get all activities with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with activities data
   */
  getActivities: async (params = {}) => {
    return await api.get("/activities", { params });
  },

  /**
   * Get activities in date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with activities data
   */
  getActivitiesByDateRange: async (startDate, endDate, params = {}) => {
    return await api.get("/activities/calendar", {
      params: {
        startDate,
        endDate,
        ...params,
      },
    });
  },

  /**
   * Get activity by ID
   * @param {string|number} id - Activity ID
   * @returns {Promise} Response with activity data
   */
  getActivityById: async (id) => {
    return await api.get(`/activities/${id}`);
  },

  /**
   * Create new activity
   * @param {Object} activityData - Activity data
   * @returns {Promise} Response with created activity
   */
  createActivity: async (activityData) => {
    return await api.post("/activities", activityData);
  },

  /**
   * Update activity
   * @param {string|number} id - Activity ID
   * @param {Object} activityData - Activity data to update
   * @returns {Promise} Response with updated activity
   */
  updateActivity: async (id, activityData) => {
    return await api.patch(`/activities/${id}`, activityData);
  },

  /**
   * Delete activity
   * @param {string|number} id - Activity ID
   * @returns {Promise} Response
   */
  deleteActivity: async (id) => {
    return await api.delete(`/activities/${id}`);
  },

  /**
   * Add participant to activity
   * @param {string|number} activityId - Activity ID
   * @param {string|number} userId - User ID
   * @param {boolean} needsTransport - Whether participant needs transport
   * @returns {Promise} Response with participant data
   */
  addParticipant: async (activityId, userId, needsTransport = false) => {
    return await api.post(`/activities/${activityId}/participants`, {
      userId,
      needsTransport,
    });
  },

  /**
   * Remove participant from activity
   * @param {string|number} activityId - Activity ID
   * @param {string|number} userId - User ID
   * @returns {Promise} Response
   */
  removeParticipant: async (activityId, userId) => {
    return await api.delete(`/activities/${activityId}/participants/${userId}`);
  },

  /**
   * Add accompagnateur to activity
   * @param {string|number} activityId - Activity ID
   * @param {string|number} userId - User ID
   * @returns {Promise} Response with accompagnateur data
   */
  addAccompagnateur: async (activityId, userId) => {
    return await api.post(`/activities/${activityId}/accompagnateurs`, {
      userId,
    });
  },

  /**
   * Remove accompagnateur from activity
   * @param {string|number} activityId - Activity ID
   * @param {string|number} userId - User ID
   * @returns {Promise} Response
   */
  removeAccompagnateur: async (activityId, userId) => {
    return await api.delete(
      `/activities/${activityId}/accompagnateurs/${userId}`
    );
  },
};

export default activityService;
