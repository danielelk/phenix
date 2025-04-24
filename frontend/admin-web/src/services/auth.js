import api from "./api";

const authService = {
  /**
   * Log in user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response with user data and token
   */
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });

    // Store token and user data in localStorage
    if (response.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response;
  },

  /**
   * Log out user
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Get currently logged in user
   * @returns {Promise} Response with user data
   */
  getCurrentUser: async () => {
    return await api.get("/auth/me");
  },

  /**
   * Check if user is logged in
   * @returns {boolean} True if user is logged in
   */
  isLoggedIn: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * Get user data from localStorage
   * @returns {Object|null} User data or null if not logged in
   */
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
