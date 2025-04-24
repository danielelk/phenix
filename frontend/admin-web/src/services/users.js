import api from "./api";

const userService = {
  /**
   * Get all users with pagination and filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with users data
   */
  getUsers: async (params = {}) => {
    return await api.get("/users", { params });
  },

  /**
   * Get user by ID
   * @param {string|number} id - User ID
   * @returns {Promise} Response with user data
   */
  getUserById: async (id) => {
    return await api.get(`/users/${id}`);
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise} Response with created user
   */
  createUser: async (userData) => {
    return await api.post("/users", userData);
  },

  /**
   * Update user
   * @param {string|number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} Response with updated user
   */
  updateUser: async (id, userData) => {
    return await api.patch(`/users/${id}`, userData);
  },

  /**
   * Delete user
   * @param {string|number} id - User ID
   * @returns {Promise} Response
   */
  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`);
  },

  /**
   * Get all accompagnateurs
   * @returns {Promise} Response with accompagnateurs data
   */
  getAccompagnateurs: async () => {
    return await api.get("/users/accompagnateurs");
  },

  /**
   * Get all adherents
   * @returns {Promise} Response with adherents data
   */
  getAdherents: async () => {
    return await api.get("/users/adherents");
  },
};

export default userService;
