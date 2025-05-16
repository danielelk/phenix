import React, { useState, useEffect } from "react";
import styles from "./MembershipRequestsList.module.css";
import { FiSearch, FiFilter, FiEye, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const MembershipRequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [approvalData, setApprovalData] = useState({
    membershipFee: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Fetch membership requests
  useEffect(() => {
    fetchRequests();
  }, [pagination.page, filter, searchTerm]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: filter !== "all" ? filter : undefined,
        search: searchTerm || undefined,
      };

      const response = await api.get("/membership-requests", { params });

      setRequests(response.data.requests || []);

      if (response.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total || 0,
          pages: response.pagination.pages || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching membership requests:", error);
      toast.error("Erreur lors du chargement des demandes d'adhésion");
    } finally {
      setLoading(false);
    }
  };

  // Handle status changes
  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    // Validate approval data
    if (!approvalData.membershipFee) {
      toast.error("Veuillez saisir le montant de la cotisation");
      return;
    }

    try {
      await api.patch(`/membership-requests/${selectedRequest.id}/status`, {
        status: "approved",
        membershipFee: approvalData.membershipFee,
      });

      toast.success("Demande d'adhésion approuvée avec succès");
      setShowDetails(false);
      setSelectedRequest(null);
      setApprovalData({ membershipFee: "" });
      fetchRequests();
    } catch (error) {
      console.error("Error approving membership request:", error);
      toast.error("Erreur lors de l'approbation de la demande");
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    if (!window.confirm("Êtes-vous sûr de vouloir rejeter cette demande d'adhésion ?")) {
      return;
    }

    try {
      await api.patch(`/membership-requests/${selectedRequest.id}/status`, {
        status: "rejected",
      });

      toast.success("Demande d'adhésion rejetée");
      setShowDetails(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting membership request:", error);
      toast.error("Erreur lors du rejet de la demande");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: fr });
  };

  // Get status display
  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
            En attente
          </span>
        );
      case "approved":
        return (
          <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
            Approuvée
          </span>
        );
      case "rejected":
        return (
          <span className={`${styles.statusBadge} ${styles.statusRejected}`}>
            Rejetée
          </span>
        );
      default:
        return status;
    }
  };

  // Get payment frequency display
  const getPaymentFrequencyDisplay = (frequency) => {
    switch (frequency) {
      case "monthly":
        return "Mensuel";
      case "quarterly":
        return "Trimestriel";
      case "annual":
        return "Annuel";
      default:
        return frequency;
    }
  };

  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  // Handle input changes for approval form
  const handleApprovalInputChange = (e) => {
    const { name, value } = e.target;
    setApprovalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className={styles.requestsContainer}>
      <div className={styles.headerControls}>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.statusFilter}>
          <FiFilter className={styles.filterIcon} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Chargement des demandes d'adhésion...</div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.requestsTable}>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Date de demande</th>
                  <th>Fréquence</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.noResults}>
                      Aucune demande d'adhésion trouvée
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        {request.last_name} {request.first_name}
                      </td>
                      <td>{request.email}</td>
                      <td>{request.phone}</td>
                      <td>{formatDate(request.registration_date)}</td>
                      <td>{getPaymentFrequencyDisplay(request.payment_frequency)}</td>
                      <td>{getStatusDisplay(request.status)}</td>
                      <td className={styles.actions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleViewDetails(request)}
                          title="Voir les détails"
                        >
                          <FiEye size={18} />
                        </button>
                        {request.status === "pending" && (
                          <>
                            <button
                              className={`${styles.actionButton} ${styles.approveButton}`}
                              onClick={() => handleViewDetails(request)}
                              title="Approuver"
                            >
                              <FiCheck size={18} />
                            </button>
                            <button
                              className={`${styles.actionButton} ${styles.rejectButton}`}
                              onClick={() => {
                                setSelectedRequest(request);
                                handleRejectRequest();
                              }}
                              title="Rejeter"
                            >
                              <FiX size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Précédent
            </button>
            <span className={styles.pageInfo}>
              Page {pagination.page} sur {Math.max(1, pagination.pages)}
            </span>
            <button
              className={styles.pageButton}
              disabled={pagination.page >= pagination.pages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Suivant
            </button>
          </div>
        </>
      )}

      {showDetails && selectedRequest && (
        <div className={styles.detailsOverlay}>
          <div className={styles.detailsContainer}>
            <div className={styles.detailsHeader}>
              <h3 className={styles.detailsTitle}>
                Détails de la demande d'adhésion
              </h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowDetails(false);
                  setSelectedRequest(null);
                  setApprovalData({ membershipFee: "" });
                }}
              >
                <FiX size={24} />
              </button>
            </div>

            <div className={styles.detailsContent}>
              <div className={styles.detailsSection}>
                <h4 className={styles.sectionTitle}>Informations personnelles</h4>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Nom complet</span>
                    <span className={styles.detailValue}>
                      {selectedRequest.first_name} {selectedRequest.last_name}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email</span>
                    <span className={styles.detailValue}>{selectedRequest.email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Téléphone</span>
                    <span className={styles.detailValue}>{selectedRequest.phone}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date de naissance</span>
                    <span className={styles.detailValue}>
                      {selectedRequest.birth_date ? formatDate(selectedRequest.birth_date) : "-"}
                    </span>
                  </div>
                </div>
                
                {(selectedRequest.address || selectedRequest.city || selectedRequest.postal_code) && (
                  <div className={styles.addressSection}>
                    <h5 className={styles.subSectionTitle}>Adresse</h5>
                    <p className={styles.addressText}>
                      {selectedRequest.address}
                      {selectedRequest.address && (selectedRequest.city || selectedRequest.postal_code) && <br />}
                      {selectedRequest.postal_code} {selectedRequest.city}
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.detailsSection}>
                <h4 className={styles.sectionTitle}>Contact d'urgence</h4>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Nom</span>
                    <span className={styles.detailValue}>{selectedRequest.emergency_contact_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Téléphone</span>
                    <span className={styles.detailValue}>{selectedRequest.emergency_contact_phone}</span>
                  </div>
                </div>
              </div>

              {selectedRequest.medical_notes && (
                <div className={styles.detailsSection}>
                  <h4 className={styles.sectionTitle}>Informations médicales</h4>
                  <p className={styles.medicalNotes}>{selectedRequest.medical_notes}</p>
                </div>
              )}

              <div className={styles.detailsSection}>
                <h4 className={styles.sectionTitle}>Informations d'adhésion</h4>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date de demande</span>
                    <span className={styles.detailValue}>
                      {formatDate(selectedRequest.registration_date)}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Fréquence de paiement</span>
                    <span className={styles.detailValue}>
                      {getPaymentFrequencyDisplay(selectedRequest.payment_frequency)}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Statut</span>
                    <span className={styles.detailValue}>{getStatusDisplay(selectedRequest.status)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date de création</span>
                    <span className={styles.detailValue}>
                      {formatDate(selectedRequest.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedRequest.status === "pending" && (
                <div className={styles.detailsSection}>
                  <h4 className={styles.sectionTitle}>Traitement de la demande</h4>
                  
                  <div className={styles.approvalForm}>
                    <div className={styles.formGroup}>
                      <label htmlFor="membershipFee" className={styles.formLabel}>
                        Montant de la cotisation (€) *
                      </label>
                      <input
                        type="number"
                        id="membershipFee"
                        name="membershipFee"
                        value={approvalData.membershipFee}
                        onChange={handleApprovalInputChange}
                        className={styles.formInput}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className={styles.actionButtons}>
                      <button
                        className={styles.rejectBtn}
                        onClick={handleRejectRequest}
                      >
                        Rejeter la demande
                      </button>
                      <button
                        className={styles.approveBtn}
                        onClick={handleApproveRequest}
                      >
                        Approuver l'adhésion
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipRequestsList;