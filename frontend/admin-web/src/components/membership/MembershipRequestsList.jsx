import React, { useState, useEffect } from "react";
import styles from "./MembershipRequestsList.module.css";
import { 
  FiCheck, 
  FiX, 
  FiEye, 
  FiChevronDown, 
  FiChevronUp, 
  FiUserPlus, 
  FiAlertCircle 
} from "react-icons/fi";
import { toast } from "react-toastify";
import membershipService from "../../services/membership";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const MembershipRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [paymentFrequency, setPaymentFrequency] = useState("mensuel");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await membershipService.getMembershipRequests();
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("Erreur lors du chargement des demandes:", error);
      toast.error("Erreur lors du chargement des demandes d'adhésion");
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = (id) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setExpandedRequest(request.id);
  };

  const openApproveDialog = (request) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const closeApproveDialog = () => {
    setApproveDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    try {
      await membershipService.approveRequest(selectedRequest.id, {
        paymentFrequency: paymentFrequency
      });
      
      toast.success("Demande d'adhésion approuvée avec succès");
      fetchRequests();
      closeApproveDialog();
    } catch (error) {
      console.error("Erreur lors de l'approbation de la demande:", error);
      toast.error("Erreur lors de l'approbation de la demande");
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir rejeter cette demande ?")) {
      return;
    }

    try {
      await membershipService.rejectRequest(requestId);
      toast.success("Demande d'adhésion rejetée");
      fetchRequests();
    } catch (error) {
      console.error("Erreur lors du rejet de la demande:", error);
      toast.error("Erreur lors du rejet de la demande");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className={styles.pendingBadge}>En attente</span>;
      case "approved":
        return <span className={styles.approvedBadge}>Approuvée</span>;
      case "rejected":
        return <span className={styles.rejectedBadge}>Rejetée</span>;
      default:
        return <span className={styles.pendingBadge}>{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "dd MMMM yyyy à HH:mm", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={styles.requestsListContainer}>
      <h2 className={styles.pageTitle}>Demandes d'adhésion</h2>

      {loading ? (
        <div className={styles.loading}>Chargement des demandes...</div>
      ) : requests.length === 0 ? (
        <div className={styles.emptyState}>
          <FiAlertCircle size={40} />
          <p>Aucune demande d'adhésion en attente</p>
        </div>
      ) : (
        <div className={styles.requestsList}>
          {requests.map((request) => (
            <div key={request.id} className={styles.requestCard}>
              <div className={styles.requestHeader}>
                <div className={styles.requestBasicInfo}>
                  <h3 className={styles.requestName}>
                    {request.last_name} {request.first_name}
                  </h3>
                  <p className={styles.requestEmail}>{request.email}</p>
                </div>

                <div className={styles.requestMeta}>
                  <div className={styles.requestDate}>
                    Soumise le {formatDate(request.created_at)}
                  </div>
                  <div className={styles.requestStatus}>
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                <div className={styles.requestActions}>
                  {request.status === "pending" && (
                    <>
                      <button
                        className={`${styles.actionButton} ${styles.approveButton}`}
                        onClick={() => openApproveDialog(request)}
                        title="Approuver"
                      >
                        <FiCheck size={18} />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.rejectButton}`}
                        onClick={() => handleRejectRequest(request.id)}
                        title="Rejeter"
                      >
                        <FiX size={18} />
                      </button>
                    </>
                  )}
                  <button
                    className={styles.actionButton}
                    onClick={() => handleExpand(request.id)}
                    title="Voir les détails"
                  >
                    {expandedRequest === request.id ? (
                      <FiChevronUp size={18} />
                    ) : (
                      <FiChevronDown size={18} />
                    )}
                  </button>
                </div>
              </div>

              {expandedRequest === request.id && (
                <div className={styles.requestDetails}>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailSection}>
                      <h4 className={styles.sectionTitle}>Informations personnelles</h4>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Nom complet:</span>
                        <span className={styles.detailValue}>
                          {request.last_name} {request.first_name}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Email:</span>
                        <span className={styles.detailValue}>{request.email}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Téléphone:</span>
                        <span className={styles.detailValue}>{request.phone || "-"}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Genre:</span>
                        <span className={styles.detailValue}>
                          {request.genre === "masculin" ? "Masculin" : "Féminin"}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Nationalité:</span>
                        <span className={styles.detailValue}>{request.nationalite || "-"}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Adresse:</span>
                        <span className={styles.detailValue}>
                          {request.address
                            ? `${request.address}, ${request.postal_code || ""} ${
                                request.city || ""
                              }`
                            : "-"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.detailSection}>
                      <h4 className={styles.sectionTitle}>Informations d'adhésion</h4>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Type:</span>
                        <span className={styles.detailValue}>
                          {request.est_benevole ? "Bénévole" : "Adhérent"}
                        </span>
                      </div>
                      {!request.est_benevole && (
                        <>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Formule:</span>
                            <span className={styles.detailValue}>
                              {request.formule_titre || "-"} 
                              ({request.formule_prix ? `${request.formule_prix}€` : ""})
                            </span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Options:</span>
                            <span className={styles.detailValue}>
                              {request.inscription_sport && request.inscription_loisirs
                                ? "Sport et Loisirs"
                                : request.inscription_sport
                                ? "Sport"
                                : request.inscription_loisirs
                                ? "Loisirs"
                                : "-"}
                            </span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Contact d'urgence:</span>
                            <span className={styles.detailValue}>
                              {request.emergency_contact_name
                                ? `${request.emergency_contact_name} (${request.emergency_contact_phone})`
                                : "-"}
                            </span>
                          </div>
                          {request.medical_notes && (
                            <div className={styles.detailItem}>
                              <span className={styles.detailLabel}>Informations médicales:</span>
                              <span className={styles.detailValue}>{request.medical_notes}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Autorisation d'image:</span>
                        <span className={styles.detailValue}>
                          {request.autorisation_image ? "Oui" : "Non"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {approveDialogOpen && selectedRequest && (
        <div className={styles.approveOverlay}>
          <div className={styles.approveDialog}>
            <h3>Approuver la demande d'adhésion</h3>
            <p>
              Vous êtes sur le point d'approuver la demande d'adhésion de{" "}
              <strong>
                {selectedRequest.first_name} {selectedRequest.last_name}
              </strong>
              .
            </p>

            {!selectedRequest.est_benevole && (
              <div className={styles.paymentDetails}>
                <h4>Détails du paiement</h4>
                <div className={styles.formuleInfo}>
                  <span className={styles.formuleTitle}>
                    {selectedRequest.formule_titre}
                  </span>
                  <span className={styles.formulePrice}>
                    {selectedRequest.formule_prix}€
                  </span>
                </div>

                <div className={styles.frequencySelector}>
                  <label className={styles.frequencyLabel}>
                    Fréquence de paiement:
                  </label>
                  <div className={styles.radioGroup}>
                    <div className={styles.radioOption}>
                      <input
                        type="radio"
                        id="mensuel"
                        name="frequency"
                        value="mensuel"
                        checked={paymentFrequency === "mensuel"}
                        onChange={() => setPaymentFrequency("mensuel")}
                        className={styles.radioInput}
                      />
                      <label htmlFor="mensuel" className={styles.radioLabel}>
                        Mensuel
                        <span className={styles.frequencyPrice}>
                          ({(selectedRequest.formule_prix / 12).toFixed(2)}€/mois)
                        </span>
                      </label>
                    </div>
                    <div className={styles.radioOption}>
                      <input
                        type="radio"
                        id="trimestriel"
                        name="frequency"
                        value="trimestriel"
                        checked={paymentFrequency === "trimestriel"}
                        onChange={() => setPaymentFrequency("trimestriel")}
                        className={styles.radioInput}
                      />
                      <label htmlFor="trimestriel" className={styles.radioLabel}>
                        Trimestriel
                        <span className={styles.frequencyPrice}>
                          ({(selectedRequest.formule_prix / 4).toFixed(2)}€/trimestre)
                        </span>
                      </label>
                    </div>
                    <div className={styles.radioOption}>
                      <input
                        type="radio"
                        id="annuel"
                        name="frequency"
                        value="annuel"
                        checked={paymentFrequency === "annuel"}
                        onChange={() => setPaymentFrequency("annuel")}
                        className={styles.radioInput}
                      />
                      <label htmlFor="annuel" className={styles.radioLabel}>
                        Annuel
                        <span className={styles.frequencyPrice}>
                          ({selectedRequest.formule_prix}€/an)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.approveActions}>
              <button
                className={styles.cancelButton}
                onClick={closeApproveDialog}
              >
                Annuler
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleApproveRequest}
              >
                <FiUserPlus size={18} />
                Approuver et créer le compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipRequestsList;