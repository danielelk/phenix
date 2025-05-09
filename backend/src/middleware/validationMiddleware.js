const logger = require("../utils/logger");

/**
 * Middleware for validating request data
 * @param {Function} schema - Validation schema function
 */
exports.validate = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema(req.body);

      if (error) {
        logger.warn("Validation error:", error.details);
        return res.status(400).json({
          status: "fail",
          message: "Validation error",
          errors: error.details.map((detail) => ({
            field: detail.context.key,
            message: detail.message.replace(/['"]/g, ""),
          })),
        });
      }

      // Replace request body with validated data
      req.body = value;
      next();
    } catch (err) {
      logger.error("Error in validation middleware:", err);
      next(err);
    }
  };
};

/**
 * Basic validation schemas
 */
exports.schemas = {
  /**
   * User registration validation
   */
  userRegistration: (data) => {
    const errors = [];

    // Validate required fields
    if (!data.firstName || data.firstName.trim() === "") {
      errors.push({
        context: { key: "firstName" },
        message: "Le prénom est requis",
      });
    }

    if (!data.lastName || data.lastName.trim() === "") {
      errors.push({
        context: { key: "lastName" },
        message: "Le nom est requis",
      });
    }

    if (!data.email || data.email.trim() === "") {
      errors.push({
        context: { key: "email" },
        message: "L'email est requis",
      });
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push({
          context: { key: "email" },
          message: "Format d'email invalide",
        });
      }
    }

    if (!data.password || data.password.trim() === "") {
      errors.push({
        context: { key: "password" },
        message: "Le mot de passe est requis",
      });
    } else if (data.password.length < 6) {
      errors.push({
        context: { key: "password" },
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Validate role
    const validRoles = ["admin", "accompagnateur", "adherent", "benevole"];
    if (!data.role || !validRoles.includes(data.role)) {
      errors.push({
        context: { key: "role" },
        message: "Rôle invalide",
      });
    }

    return {
      error: errors.length > 0 ? { details: errors } : null,
      value: data,
    };
  },

  /**
   * User update validation
   */
  userUpdate: (data) => {
    const errors = [];

    // Validate optional fields if present
    if (
      data.firstName !== undefined &&
      (data.firstName === null || data.firstName.trim() === "")
    ) {
      errors.push({
        context: { key: "firstName" },
        message: "Le prénom ne peut pas être vide",
      });
    }

    if (
      data.lastName !== undefined &&
      (data.lastName === null || data.lastName.trim() === "")
    ) {
      errors.push({
        context: { key: "lastName" },
        message: "Le nom ne peut pas être vide",
      });
    }

    if (data.email !== undefined) {
      if (data.email === null || data.email.trim() === "") {
        errors.push({
          context: { key: "email" },
          message: "L'email ne peut pas être vide",
        });
      } else {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          errors.push({
            context: { key: "email" },
            message: "Format d'email invalide",
          });
        }
      }
    }

    // Validate role if present
    if (data.role !== undefined) {
      const validRoles = ["admin", "accompagnateur", "adherent", "benevole"];
      if (!validRoles.includes(data.role)) {
        errors.push({
          context: { key: "role" },
          message: "Rôle invalide",
        });
      }
    }

    return {
      error: errors.length > 0 ? { details: errors } : null,
      value: data,
    };
  },

  /**
   * Login validation
   */
  login: (data) => {
    const errors = [];

    if (!data.email || data.email.trim() === "") {
      errors.push({
        context: { key: "email" },
        message: "L'email est requis",
      });
    }

    if (!data.password || data.password.trim() === "") {
      errors.push({
        context: { key: "password" },
        message: "Le mot de passe est requis",
      });
    }

    return {
      error: errors.length > 0 ? { details: errors } : null,
      value: data,
    };
  },

  activityCreate: (data) => {
    const errors = [];

    if (!data.title || data.title.trim() === "") {
      errors.push({
        context: { key: "title" },
        message: "Le titre est requis",
      });
    }

    if (!data.startDate) {
      errors.push({
        context: { key: "startDate" },
        message: "La date de début est requise",
      });
    }

    if (!data.endDate) {
      errors.push({
        context: { key: "endDate" },
        message: "La date de fin est requise",
      });
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (start > end) {
        errors.push({
          context: { key: "endDate" },
          message: "La date de fin doit être après la date de début",
        });
      }
    }

    if (!data.location || data.location.trim() === "") {
      errors.push({
        context: { key: "location" },
        message: "Le lieu est requis",
      });
    }

    // Validate activity type
    const validTypes = ["with_adherents", "without_adherents"];
    if (!data.type || !validTypes.includes(data.type)) {
      errors.push({
        context: { key: "type" },
        message: "Type d'activité invalide",
      });
    }

    // Validate transport capacity if transport is available
    if (
      data.transportAvailable &&
      (data.transportCapacity === undefined || data.transportCapacity < 1)
    ) {
      errors.push({
        context: { key: "transportCapacity" },
        message:
          "La capacité de transport doit être au moins 1 si le transport est disponible",
      });
    }

    // Validate price if activity is paid
    if (
      data.isPaid &&
      (data.price === undefined || parseFloat(data.price) <= 0)
    ) {
      errors.push({
        context: { key: "price" },
        message: "Le prix doit être supérieur à 0 si l'activité est payante",
      });
    }

    return {
      error: errors.length > 0 ? { details: errors } : null,
      value: data,
    };
  },

  /**
   * Activity update validation
   */
  activityUpdate: (data) => {
    const errors = [];

    if (
      data.title !== undefined &&
      (data.title === null || data.title.trim() === "")
    ) {
      errors.push({
        context: { key: "title" },
        message: "Le titre ne peut pas être vide",
      });
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (start > end) {
        errors.push({
          context: { key: "endDate" },
          message:
            "La date/heure de fin doit être après la date/heure de début",
        });
      }
    }

    // Validate activity type if present
    if (data.type !== undefined) {
      const validTypes = ["with_adherents", "without_adherents"];
      if (!validTypes.includes(data.type)) {
        errors.push({
          context: { key: "type" },
          message: "Type d'activité invalide",
        });
      }
    }

    // Validate transport capacity if transport is available
    if (
      data.transportAvailable === true &&
      (data.transportCapacity === undefined || data.transportCapacity < 1)
    ) {
      errors.push({
        context: { key: "transportCapacity" },
        message:
          "La capacité de transport doit être au moins 1 si le transport est disponible",
      });
    }

    // Validate price if activity is paid
    if (
      data.isPaid === true &&
      (data.price === undefined || parseFloat(data.price) <= 0)
    ) {
      errors.push({
        context: { key: "price" },
        message: "Le prix doit être supérieur à 0 si l'activité est payante",
      });
    }

    return {
      error: errors.length > 0 ? { details: errors } : null,
      value: data,
    };
  },
};
