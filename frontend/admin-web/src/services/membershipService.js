import api from "./api";

const membershipService = {
  /**
   * Submit a public membership request
   * @param {Object} requestData - Membership request data
   * @returns {Promise} Response with created membership request
   */
  submitMembershipRequest: async (requestData) => {
    return await api.post("/public/membership-requests", requestData);
  },

  /**
   * Get all membership requests with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with membership requests
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
   * Update membership request status
   * @param {string|number} id - Membership request ID
   * @param {string} status - New status (pending, approved, rejected)
   * @param {Object} additionalData - Additional data for approval
   * @returns {Promise} Response with updated membership request
   */
  updateMembershipRequestStatus: async (id, status, additionalData = null) => {
    const data = { status };
    
    if (status === "approved" && additionalData) {
      data.membershipFee = additionalData.membershipFee;
    }
    
    return await api.patch(`/membership-requests/${id}/status`, data);
  },
};

export default membershipService;