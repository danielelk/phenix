const { MembershipRequest } = require("../models/MembershipRequest");
const { User, userRoles } = require("../models/User");
const logger = require("../utils/logger");

exports.getMembershipRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const requests = await MembershipRequest.findAll({ status });

    res.status(200).json({
      status: "success",
      data: {
        membershipRequests: requests,
      },
    });
  } catch (error) {
    logger.error("Get membership requests error:", error);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la récupération des demandes d'adhésion",
    });
  }
};

exports.getMembershipRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const membershipRequest = await MembershipRequest.findById(id);

    if (!membershipRequest) {
      return res.status(404).json({
        status: "fail",
        message: "Demande d'adhésion non trouvée",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        membershipRequest,
      },
    });
  } catch (error) {
    logger.error(`Get membership request by ID error: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la récupération de la demande d'adhésion",
    });
  }
};

exports.createMembershipRequest = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      genre,
      nationalite,
      formuleId,
      estBenevole,
      inscriptionSport,
      inscriptionLoisirs,
      autorisationImage,
      notes,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
      address,
      city,
      postalCode,
      dateOfBirth,
      billingEmail
    } = req.body;

    const existingRequest = await MembershipRequest.findByEmail(email);
    if (existingRequest && existingRequest.status === 'pending') {
      return res.status(400).json({
        status: "fail",
        message: "Une demande d'adhésion est déjà en cours de traitement avec cet email",
      });
    }

    if (!dateOfBirth) {
      return res.status(400).json({
        status: "fail",
        message: "La date de naissance est obligatoire",
      });
    }

    const newMembershipRequest = await MembershipRequest.create({
      firstName,
      lastName,
      email,
      phone,
      genre,
      nationalite,
      formuleId,
      estBenevole,
      inscriptionSport,
      inscriptionLoisirs,
      autorisationImage,
      notes,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
      address,
      city,
      postalCode,
      dateOfBirth,
      billingEmail,
      status: "pending",
    });

    res.status(201).json({
      status: "success",
      data: {
        membershipRequest: newMembershipRequest,
      },
    });
  } catch (error) {
    logger.error("Create membership request error:", error);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la création de la demande d'adhésion",
    });
  }
};

exports.updateMembershipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      genre,
      nationalite,
      formuleId,
      estBenevole,
      inscriptionSport,
      inscriptionLoisirs,
      autorisationImage,
      notes,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
      status,
      address,
      city,
      postalCode,
      dateOfBirth,
      billingEmail
    } = req.body;

    const updatedMembershipRequest = await MembershipRequest.update(id, {
      firstName,
      lastName,
      email,
      phone,
      genre,
      nationalite,
      formuleId,
      estBenevole,
      inscriptionSport,
      inscriptionLoisirs,
      autorisationImage,
      notes,
      emergencyContactName,
      emergencyContactPhone,
      medicalNotes,
      status,
      address,
      city,
      postalCode,
      dateOfBirth,
      billingEmail
    });

    res.status(200).json({
      status: "success",
      data: {
        membershipRequest: updatedMembershipRequest,
      },
    });
  } catch (error) {
    logger.error(`Update membership request error: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la mise à jour de la demande d'adhésion",
    });
  }
};

exports.deleteMembershipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MembershipRequest.delete(id);

    if (!deleted) {
      return res.status(404).json({
        status: "fail",
        message: "Demande d'adhésion non trouvée",
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error(`Delete membership request error: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la suppression de la demande d'adhésion",
    });
  }
};

exports.approveMembershipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const membershipRequest = await MembershipRequest.findById(id);
    
    if (!membershipRequest) {
      return res.status(404).json({
        status: "fail",
        message: "Demande d'adhésion non trouvée",
      });
    }
    
    if (membershipRequest.status === 'approved') {
      return res.status(400).json({
        status: "fail",
        message: "Cette demande d'adhésion a déjà été approuvée",
      });
    }
    
    const password = generateRandomPassword();
    
    const newUser = await User.create({
      firstName: membershipRequest.first_name,
      lastName: membershipRequest.last_name,
      email: membershipRequest.email,
      password: password,
      phone: membershipRequest.phone,
      role: userRoles.ADHERENT,
      emergencyContactName: membershipRequest.emergency_contact_name || null,
      emergencyContactPhone: membershipRequest.emergency_contact_phone || null,
      medicalNotes: membershipRequest.medical_notes || null,
      isVehiculed: false,
    });
    
    await MembershipRequest.update(id, {
      status: 'approved'
    });
    
    res.status(200).json({
      status: "success",
      message: "Demande d'adhésion approuvée avec succès",
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name
        }
      }
    });
    
  } catch (error) {
    logger.error(`Approve membership request error: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de l'approbation de la demande d'adhésion",
    });
  }
};

exports.rejectMembershipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const membershipRequest = await MembershipRequest.findById(id);
    
    if (!membershipRequest) {
      return res.status(404).json({
        status: "fail",
        message: "Demande d'adhésion non trouvée",
      });
    }
    
    if (membershipRequest.status === 'rejected') {
      return res.status(400).json({
        status: "fail",
        message: "Cette demande d'adhésion a déjà été rejetée",
      });
    }
    
    await MembershipRequest.update(id, {
      status: 'rejected',
      notes: reason || membershipRequest.notes
    });
    
    res.status(200).json({
      status: "success",
      message: "Demande d'adhésion rejetée avec succès"
    });
    
  } catch (error) {
    logger.error(`Reject membership request error: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Erreur lors du rejet de la demande d'adhésion",
    });
  }
};

function generateRandomPassword() {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}