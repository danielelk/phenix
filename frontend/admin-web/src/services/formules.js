import api from "./api";

const formulesService = {
  getFormules: async (params = {}) => {
    return await api.get("/formules", { params });
  },

  getFormuleById: async (id) => {
    return await api.get(`/formules/${id}`);
  },

  createFormule: async (formuleData) => {
    return await api.post("/formules", formuleData);
  },

  updateFormule: async (id, formuleData) => {
    return await api.patch(`/formules/${id}`, formuleData);
  },

  deleteFormule: async (id) => {
    return await api.delete(`/formules/${id}`);
  },

  getPublicFormules: async () => {
    return await api.get("/formules/public");
  }
};

export default formulesService;