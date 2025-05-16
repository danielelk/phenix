const Formule = require("../models/Formule");
const logger = require("../utils/logger");

/**
 * Get all formules
 * @route GET /api/formules
 */
exports.getFormules = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    
    const options = {
      activeOnly: activeOnly === 'false' ? false : true,
    };

    let formules = await Formule.findAll(options);

    // If no formules found, return default ones
    if (formules.length === 0) {
      formules = await Formule.getDefaultFormules();
    }

    res.status(200).json({
      status: "success",
      data: {
        formules,
      },
    });
  } catch (error) {
    logger.error("Get formules error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting formules",
    });
  }
};

/**
 * Get formule by ID
 * @route GET /api/formules/:id
 */
exports.getFormuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const formule = await Formule.findById(id);

    if (!formule) {
      return res.status(404).json({
        status: "fail",
        message: "Formule not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        formule,
      },
    });
  } catch (error) {
    logger.error("Get formule by ID error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting formule",
    });
  }
};

/**
 * Create a new formule
 * @route POST /api/formules
 */
exports.createFormule = async (req, res) => {
  try {
    const { titre, description, prix, estActif } = req.body;

    if (!titre || prix === undefined) {
      return res.status(400).json({
        status: "fail",
        message: "Le titre et le prix sont requis",
      });
    }

    // Validate price
    const parsedPrice = parseFloat(prix);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        status: "fail",
        message: "Le prix doit être un nombre positif",
      });
    }

    const newFormule = await Formule.create({
      titre,
      description,
      prix: parsedPrice,
      estActif,
    });

    res.status(201).json({
      status: "success",
      data: {
        formule: newFormule,
      },
    });
  } catch (error) {
    logger.error("Create formule error:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating formule",
    });
  }
};

/**
 * Update formule
 * @route PATCH /api/formules/:id
 */
exports.updateFormule = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, prix, estActif } = req.body;

    // Check if formule exists
    const existingFormule = await Formule.findById(id);
    if (!existingFormule) {
      return res.status(404).json({
        status: "fail",
        message: "Formule not found",
      });
    }

    // Validate price if provided
    if (prix !== undefined) {
      const parsedPrice = parseFloat(prix);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          status: "fail",
          message: "Le prix doit être un nombre positif",
        });
      }
    }

    // Update formule
    const updatedFormule = await Formule.update(id, {
      titre,
      description,
      prix: prix !== undefined ? parseFloat(prix) : undefined,
      estActif,
    });

    res.status(200).json({
      status: "success",
      data: {
        formule: updatedFormule,
      },
    });
  } catch (error) {
    logger.error("Update formule error:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating formule",
    });
  }
};

/**
 * Delete formule
 * @route DELETE /api/formules/:id
 */
exports.deleteFormule = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if formule exists
    const existingFormule = await Formule.findById(id);
    if (!existingFormule) {
      return res.status(404).json({
        status: "fail",
        message: "Formule not found",
      });
    }

    // Delete formule
    const deleted = await Formule.delete(id);

    if (!deleted) {
      return res.status(500).json({
        status: "error",
        message: "Failed to delete formule",
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error("Delete formule error:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting formule",
    });
  }
};

/**
 * Get public formules (active only)
 * @route GET /api/public/formules
 */
exports.getPublicFormules = async (req, res) => {
  try {
    let formules = await Formule.findAll({ activeOnly: true });
    
    // If no formules found, return default ones
    if (formules.length === 0) {
      formules = await Formule.getDefaultFormules();
    }

    res.status(200).json({
      status: "success",
      data: {
        formules,
      },
    });
  } catch (error) {
    logger.error("Get public formules error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting formules",
    });
  }
};