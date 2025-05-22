import React, { useState, useEffect } from "react";
import styles from "./ActivityParticipants.module.css";
import {
  FiUserPlus,
  FiTrash2,
  FiX,
  FiSearch,
  FiCheck,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-toastify";
import userService from "../../services/users";
import activityService from "../../services/activities";

const ActivityParticipants = ({ activity, onClose, onUpdate }) => {
  const [participants, setParticipants] = useState([]);
  const [availableAdherents, setAvailableAdherents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAdherents, setFilteredAdherents] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activity]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAdherents(availableAdherents);
    } else {
      const filtered = availableAdherents.filter(
        (adherent) =>
          `${adherent.first_name} ${adherent.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          adherent.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAdherents(filtered);
    }
  }, [searchTerm, availableAdherents]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const activityDetails = await activityService.getActivityById(activity.id);
      setParticipants(activityDetails.data.participants || []);

      const allAdherentsResponse = await userService.getAdherents();
      const allAdherents = allAdherentsResponse.data.adherents || [];

      const participantIds = activityDetails.data.participants.map((p) => p.id);
      const available = allAdherents.filter(
        (adherent) => !participantIds.includes(adherent.id)
      );

      setAvailableAdherents(available);
      setFilteredAdherents(available);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async (adherent) => {
    try {
      await activityService.addParticipant(activity.id, adherent.id, false);

      // Update local state instead of refetching
      setParticipants((prev) => [...prev, adherent]);
      setAvailableAdherents((prev) => prev.filter((a) => a.id !== adherent.id));
      setSearchTerm("");

      toast.success(
        `${adherent.first_name} ${adherent.last_name} ajouté(e) à l'activité`
      );

      // Only trigger parent update for activity list refresh, don't close modal
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error adding participant:", error);
      toast.error("Erreur lors de l'ajout du participant");
    }
  };

  const handleRemoveParticipant = async (participant) => {
    try {
      await activityService.removeParticipant(activity.id, participant.id);

      // Update local state instead of refetching
      setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
      setAvailableAdherents((prev) => [...prev, participant]);

      toast.success(
        `${participant.first_name} ${participant.last_name} retiré(e) de l'activité`
      );

      // Only trigger parent update for activity list refresh, don't close modal
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error removing participant:", error);
      toast.error("Erreur lors du retrait du participant");
    }
  };

  const toggleTransportNeeded = async (participant) => {
    try {
      // Remove and re-add with new transport setting
      await activityService.removeParticipant(activity.id, participant.id);
      await activityService.addParticipant(
        activity.id,
        participant.id,
        !participant.needs_transport
      );

      // Update local state
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participant.id
            ? { ...p, needs_transport: !p.needs_transport }
            : p
        )
      );

      toast.success(
        `Transport ${
          !participant.needs_transport ? "activé" : "désactivé"
        } pour ${participant.first_name} ${participant.last_name}`
      );

      // Only trigger parent update for activity list refresh, don't close modal
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating transport need:", error);
      toast.error("Erreur lors de la mise à jour du transport");
    }
  };

  return (
    <div className={styles.participantsContainer}>
      <div className={styles.header}>
        <h2>Gestion des participants</h2>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fermer"
        >
          <FiX size={24} />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.activityInfo}>
          <h3>{activity.title}</h3>
          <p className={styles.activityMeta}>{activity.location}</p>
        </div>

        <div className={styles.participantsList}>
          <div className={styles.sectionHeader}>
            <h4>
              Participants ({participants.length}
              {activity.max_participants ? `/${activity.max_participants}` : ""}
              )
            </h4>
            <button
              className={styles.addButton}
              onClick={() => setAddingParticipant(true)}
              disabled={addingParticipant}
            >
              <FiUserPlus size={18} /> Ajouter
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>Chargement des participants...</div>
          ) : participants.length === 0 ? (
            <div className={styles.emptyState}>
              <FiUser size={48} className={styles.emptyIcon} />
              <p>Aucun participant pour cette activité</p>
            </div>
          ) : (
            <ul className={styles.participantsGrid}>
              {participants.map((participant) => (
                <li key={participant.id} className={styles.participantItem}>
                  <div className={styles.participantInfo}>
                    <span className={styles.participantName}>
                      {participant.last_name} {participant.first_name}
                    </span>
                    <span className={styles.participantEmail}>
                      {participant.email}
                    </span>
                  </div>

                  {activity.transport_available && (
                    <button
                      className={`${styles.transportButton} ${
                        participant.needs_transport
                          ? styles.transportActive
                          : ""
                      }`}
                      onClick={() => toggleTransportNeeded(participant)}
                      title={
                        participant.needs_transport
                          ? "Transport requis"
                          : "Transport non requis"
                      }
                    >
                      {participant.needs_transport
                        ? "Transport"
                        : "Sans transport"}
                    </button>
                  )}

                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveParticipant(participant)}
                    title="Retirer de l'activité"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {addingParticipant && (
          <div className={styles.addParticipantsSection}>
            <div className={styles.sectionHeader}>
              <h4>Ajouter des participants</h4>
              <button
                className={styles.closeAddButton}
                onClick={() => {
                  setAddingParticipant(false);
                  setSearchTerm("");
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className={styles.searchBar}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Rechercher un adhérent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {filteredAdherents.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Aucun adhérent disponible</p>
              </div>
            ) : (
              <ul className={styles.adherentsList}>
                {filteredAdherents.map((adherent) => (
                  <li key={adherent.id} className={styles.adherentItem}>
                    <div className={styles.adherentInfo}>
                      <span className={styles.adherentName}>
                        {adherent.last_name} {adherent.first_name}
                      </span>
                      <span className={styles.adherentEmail}>
                        {adherent.email}
                      </span>
                    </div>
                    <button
                      className={styles.addUserButton}
                      onClick={() => handleAddParticipant(adherent)}
                    >
                      <FiCheck size={18} />
                      Ajouter
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityParticipants;