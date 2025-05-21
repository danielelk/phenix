import api from "./api";

const membershipService = {
  /**
   * Create membership request
   * @param {Object} requestData - Membership request data
   * @returns {Promise} Response with created membership request
   */
  createMembershipRequest: async (requestData) => {
    return await api.post("/membership-requests", requestData);
  },

  /**
   * Get all membership requests
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with membership requests data
   */
  getMembershipRequests: async (params = {}) => {
    return await api.get("/membership-requests", { params });
  },

  /**
   * Get membership request by ID
   * @param {string|number} id - Membership request ID
   * @returns {Promise} Response with membership request data
   */
  getMembershipRequestById: async (id) => {
    return await api.get(`/membership-requests/${id}`);
  },

  /**
   * Approve membership request
   * @param {string|number} id - Membership request ID
   * @param {Object} data - Additional data for approval (payment frequency, etc.)
   * @returns {Promise} Response with approved membership request
   */
  approveRequest: async (id, data = {}) => {
    return await api.post(`/membership-requests/${id}/approve`, data);
  },

  /**
   * Reject membership request
   * @param {string|number} id - Membership request ID
   * @param {Object} data - Optional rejection reason
   * @returns {Promise} Response with rejected membership request
   */
  rejectRequest: async (id, data = {}) => {
    return await api.post(`/membership-requests/${id}/reject`, data);
  },

  /**
   * Get user's membership data
   * @param {string|number} userId - User ID
   * @returns {Promise} Response with user's membership data
   */
  getUserMembership: async (userId) => {
    return await api.get(`/memberships/user/${userId}`);
  },

  /**
   * Update payment status for a membership
   * @param {string|number} membershipId - Membership ID
   * @param {Object} data - Payment data
   * @returns {Promise} Response with updated membership
   */
  updatePaymentStatus: async (membershipId, data) => {
    return await api.patch(`/memberships/${membershipId}/payment`, data);
  },

  /**
   * Get membership statistics
   * @returns {Promise} Response with membership statistics
   */
  getMembershipStats: async () => {
    return await api.get("/memberships/stats");
  },

  /**
   * Renew membership
   * @param {string|number} userId - User ID
   * @param {Object} data - Renewal data
   * @returns {Promise} Response with renewed membership
   */
  renewMembership: async (userId, data) => {
    return await api.post(`/memberships/user/${userId}/renew`, data);
  }
};

export default membershipService;