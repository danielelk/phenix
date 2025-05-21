import api from "./api";

const formulesService = {
  /**
   * Get all formules
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with formules data
   */
  getFormules: async (params = {}) => {
    return await api.get("/formules", { params });
  },

  /**
   * Get formule by ID
   * @param {string|number} id - Formule ID
   * @returns {Promise} Response with formule data
   */
  getFormuleById: async (id) => {
    return await api.get(`/formules/${id}`);
  },

  /**
   * Create new formule
   * @param {Object} formuleData - Formule data
   * @returns {Promise} Response with created formule
   */
  createFormule: async (formuleData) => {
    return await api.post("/formules", formuleData);
  },

  /**
   * Update formule
   * @param {string|number} id - Formule ID
   * @param {Object} formuleData - Formule data to update
   * @returns {Promise} Response with updated formule
   */
  updateFormule: async (id, formuleData) => {
    return await api.patch(`/formules/${id}`, formuleData);
  },

  /**
   * Delete formule
   * @param {string|number} id - Formule ID
   * @returns {Promise} Response
   */
  deleteFormule: async (id) => {
    return await api.delete(`/formules/${id}`);
  },

  /**
   * Get active formules
   * @returns {Promise} Response with active formules
   */
  getActiveFormules: async () => {
    return await api.get("/formules/active");
  }
};

export default formulesService;