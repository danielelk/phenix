const MembershipRequest = require("../models/MembershipRequest");
const Formule = require("../models/Formule");
const logger = require("../utils/logger");

/**
 * Create a new membership request (public endpoint)
 * @route POST /api/public/membership-requests
 */
exports.createMembershipRequest = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      birthDate,
      address,
      city,
      postalCode,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
      genre,
      nationalite,
      formuleId,
      estBenevole,
      inscriptionSport,
      inscriptionLoisirs,
      autorisationImage,
      registrationDate,
    } = req.body;

    // Check for required fields
    if (!firstName || !lastName || !email || !phone || !genre || !nationalite) {
      return res.status(400).json({
        status: "fail",
        message: "Missing required fields",
      });
    }

    // If not bénévole, check for required fields for adherents
    if (!estBenevole && (!emergencyContactName || !emergencyContactPhone)) {
      return res.status(400).json({
        status: "fail",
        message: "Contact d'urgence requis pour les adhérents",
      });
    }

    // Check for valid genre
    if (genre && !["masculin", "feminin"].includes(genre)) {
      return res.status(400).json({
        status: "fail",
        message: "Genre invalide, doit être 'masculin' ou 'feminin'",
      });
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "fail",
        message: "Format d'email invalide",
      });
    }

    // Check if there's already a pending request with this email
    const emailExists = await MembershipRequest.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        status: "fail",
        message: "Une demande d'adhésion avec cet email existe déjà",
      });
    }

    // Verify formule exists if provided
    if (formuleId && !estBenevole) {
      const formule = await Formule.findById(formuleId);
      if (!formule) {
        return res.status(400).json({
          status: "fail",
          message: "La formule sélectionnée n'existe pas",
        });
      }
    }

    // Verify at least one of sport or loisirs is selected
    if (!estBenevole && !inscriptionSport && !inscriptionLoisirs) {
      return res.status(400).json({
        status: "fail",
        message: "Veuillez sélectionner au moins une option (sport ou loisirs)",
      });
    }

    // Create membership request
    const newRequest = await MembershipRequest.create({
      firstName,
      lastName,
      email,
      phone,
      birthDate,
      address,
      city,
      postalCode,
      emergencyContactName: estBenevole ? null : emergencyContactName,
      emergencyContactPhone: estBenevole ? null : emergencyContactPhone,
      medicalNotes,
      genre,
      nationalite,
      formuleId: estBenevole ? null : formuleId,
      estBenevole,
      inscriptionSport,
      inscriptionLoisirs,
      autorisationImage,
      registrationDate,
    });

    // Send success response
    res.status(201).json({
      status: "success",
      data: {
        id: newRequest.id,
        message: "Demande d'adhésion soumise avec succès",
      },
    });
  } catch (error) {
    logger.error("Create membership request error:", error);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la soumission de la demande d'adhésion",
    });
  }
};

/**
 * Get all membership requests (admin only)
 * @route GET /api/membership-requests
 */
exports.getMembershipRequests = async (req, res) => {
  try {
    const { page, limit, status, search, sortBy, sortOrder } = req.query;

    const result = await MembershipRequest.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      search,
      sortBy,
      sortOrder: sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC",
    });

    res.status(200).json({
      status: "success",
      data: {
        requests: result.requests,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error("Get membership requests error:", error);
    res.status(500).json({
      status: "error",
      message: "Erreur lors du chargement des demandes d'adhésion",
    });
  }
};

/**
 * Get membership request by ID (admin only)
 * @route GET /api/membership-requests/:id
 */
exports.getMembershipRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await MembershipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        status: "fail",
        message: "Demande d'adhésion non trouvée",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        request,
      },
    });
  } catch (error) {
    logger.error("Get membership request by ID error:", error);
    res.status(500).json({
      status: "error",
      message: "Erreur lors du chargement de la demande d'adhésion",
    });
  }
};

/**
 * Update membership request status (admin only)
 * @route PATCH /api/membership-requests/:id/status
 */
exports.updateMembershipRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, membershipFee, paymentFrequency } = req.body;

    // Validate status
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Statut invalide",
      });
    }

    // If approving, need membership fee for adherents
    const request = await MembershipRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({
        status: "fail",
        message: "Demande d'adhésion non trouvée",
      });
    }
    
    if (status === "approved" && !request.est_benevole && !membershipFee) {
      return res.status(400).json({
        status: "fail",
        message: "Le montant de la cotisation est requis pour approuver un adhérent",
      });
    }
    
    // If approving, validate payment frequency for adherents
    if (status === "approved" && !request.est_benevole && paymentFrequency) {
      if (!["monthly", "quarterly", "annual"].includes(paymentFrequency)) {
        return res.status(400).json({
          status: "fail",
          message: "Fréquence de paiement invalide",
        });
      }
    }

    // If already processed, check if status is changing
    if (request.status !== "pending" && request.status === status) {
      return res.status(400).json({
        status: "fail",
        message: `Cette demande est déjà ${status === "approved" ? "approuvée" : "rejetée"}`,
      });
    }

    // Additional data if approving
    let additionalData = null;
    if (status === "approved") {
      additionalData = {
        membershipFee: request.est_benevole ? 0 : parseFloat(membershipFee),
        paymentFrequency: paymentFrequency || 'monthly',
      };
    }

    // Update status
    const updatedRequest = await MembershipRequest.updateStatus(id, status, additionalData);

    // Response content depends on whether the request was approved
    if (status === "approved") {
      res.status(200).json({
        status: "success",
        data: {
          request: updatedRequest,
          message: request.est_benevole 
            ? "Bénévole ajouté avec succès" 
            : "Adhérent approuvé avec succès",
          password: updatedRequest.generated_password,
        },
      });
    } else {
      res.status(200).json({
        status: "success",
        data: {
          request: updatedRequest,
        },
      });
    }
  } catch (error) {
    logger.error("Update membership request status error:", error);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la mise à jour du statut de la demande",
    });
  }
};