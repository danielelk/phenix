exports.USER_ROLES = {
  ADMIN: "admin",
  ACCOMPAGNATEUR: "accompagnateur",
  ADHERENT: "adherent",
  BENEVOLE: "benevole",
};

exports.ACTIVITY_TYPES = {
  WITH_ADHERENTS: "with_adherents",
  WITHOUT_ADHERENTS: "without_adherents",
};

exports.API = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
  },
  USERS: {
    BASE: "/users",
    ACCOMPAGNATEURS: "/users/accompagnateurs",
    ADHERENTS: "/users/adherents",
  },
  ACTIVITIES: {
    BASE: "/activities",
    CALENDAR: "/activities/calendar",
    PARTICIPANTS: (id) => `/activities/${id}/participants`,
    PARTICIPANT: (id, userId) => `/activities/${id}/participants/${userId}`,
    ACCOMPAGNATEURS: (id) => `/activities/${id}/accompagnateurs`,
    ACCOMPAGNATEUR: (id, userId) =>
      `/activities/${id}/accompagnateurs/${userId}`,
  },
};

exports.ERRORS = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  NOT_FOUND: "Resource not found",
  SERVER_ERROR: "Server error, please try again later",
  VALIDATION: "Validation error, please check your input",
};

exports.SUCCESS = {
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
};

exports.PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

exports.DATE_FORMATS = {
  DEFAULT: "yyyy-MM-dd",
  DATETIME: "yyyy-MM-dd HH:mm",
  TIME: "HH:mm",
  DISPLAY: "dd MMM yyyy",
};
