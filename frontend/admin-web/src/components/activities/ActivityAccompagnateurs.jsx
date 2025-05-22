import React, { useState, useEffect } from "react";
import styles from "./ActivityAccompagnateurs.module.css";
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

const ActivityAccompagnateurs = ({ activity, onClose, onUpdate }) => {
  const [accompagnateurs, setAccompagnateurs] = useState([]);
  const [availableAccompagnateurs, setAvailableAccompagnateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingAccompagnateur, setAddingAccompagnateur] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAccompagnateurs, setFilteredAccompagnateurs] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activity]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAccompagnateurs(availableAccompagnateurs);
    } else {
      const filtered = availableAccompagnateurs.filter(
        (accompagnateur) =>
          `${accompagnateur.first_name} ${accompagnateur.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          accompagnateur.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAccompagnateurs(filtered);
    }
  }, [searchTerm, availableAccompagnateurs]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const activityDetails = await activityService.getActivityById(activity.id);
      setAccompagnateurs(activityDetails.data.accompagnateurs || []);

      const allAccompagnateursResponse = await userService.getAccompagnateurs();
      const allAccompagnateurs = allAccompagnateursResponse.data.accompagnateurs || [];

      const accompagnateurIds = activityDetails.data.accompagnateurs.map((a) => a.id);
      const available = allAccompagnateurs.filter(
        (accompagnateur) => !accompagnateurIds.includes(accompagnateur.id)
      );

      setAvailableAccompagnateurs(available);
      setFilteredAccompagnateurs(available);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccompagnateur = async (accompagnateur) => {
    try {
      await activityService.addAccompagnateur(activity.id, accompagnateur.id);

      // Update local state instead of refetching
      setAccompagnateurs((prev) => [...prev, accompagnateur]);
      setAvailableAccompagnateurs((prev) => prev.filter((a) => a.id !== accompagnateur.id));
      setSearchTerm("");

      toast.success(
        `${accompagnateur.first_name} ${accompagnateur.last_name} ajouté(e) comme accompagnateur`
      );

      // Only trigger parent update for activity list refresh, don't close modal
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error adding accompagnateur:", error);
      toast.error("Erreur lors de l'ajout de l'accompagnateur");
    }
  };

  const handleRemoveAccompagnateur = async (accompagnateur) => {
    try {
      await activityService.removeAccompagnateur(activity.id, accompagnateur.id);

      // Update local state instead of refetching
      setAccompagnateurs((prev) => prev.filter((a) => a.id !== accompagnateur.id));
      setAvailableAccompagnateurs((prev) => [...prev, accompagnateur]);

      toast.success(
        `${accompagnateur.first_name} ${accompagnateur.last_name} retiré(e) de l'activité`
      );

      // Only trigger parent update for activity list refresh, don't close modal
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error removing accompagnateur:", error);
      toast.error("Erreur lors du retrait de l'accompagnateur");
    }
  };

  return (
    <div className={styles.accompagnateursContainer}>
      <div className={styles.header}>
        <h2>Gestion des accompagnateurs</h2>
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

        <div className={styles.accompagnateursList}>
          <div className={styles.sectionHeader}>
            <h4>Accompagnateurs ({accompagnateurs.length})</h4>
            <button
              className={styles.addButton}
              onClick={() => setAddingAccompagnateur(true)}
              disabled={addingAccompagnateur}
            >
              <FiUserPlus size={18} /> Ajouter
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>Chargement des accompagnateurs...</div>
          ) : accompagnateurs.length === 0 ? (
            <div className={styles.emptyState}>
              <FiUser size={48} className={styles.emptyIcon} />
              <p>Aucun accompagnateur assigné à cette activité</p>
            </div>
          ) : (
            <ul className={styles.accompagnateursGrid}>
              {accompagnateurs.map((accompagnateur) => (
                <li key={accompagnateur.id} className={styles.accompagnateurItem}>
                  <div className={styles.accompagnateurInfo}>
                    <span className={styles.accompagnateurName}>
                      {accompagnateur.last_name} {accompagnateur.first_name}
                    </span>
                    <span className={styles.accompagnateurEmail}>
                      {accompagnateur.email}
                    </span>
                  </div>

                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveAccompagnateur(accompagnateur)}
                    title="Retirer de l'activité"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {addingAccompagnateur && (
          <div className={styles.addAccompagnateursSection}>
            <div className={styles.sectionHeader}>
              <h4>Ajouter des accompagnateurs</h4>
              <button
                className={styles.closeAddButton}
                onClick={() => {
                  setAddingAccompagnateur(false);
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
                placeholder="Rechercher un accompagnateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {filteredAccompagnateurs.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Aucun accompagnateur disponible</p>
              </div>
            ) : (
              <ul className={styles.accompagnateursList}>
                {filteredAccompagnateurs.map((accompagnateur) => (
                  <li key={accompagnateur.id} className={styles.accompagnateurItem}>
                    <div className={styles.accompagnateurInfo}>
                      <span className={styles.accompagnateurName}>
                        {accompagnateur.last_name} {accompagnateur.first_name}
                      </span>
                      <span className={styles.accompagnateurEmail}>
                        {accompagnateur.email}
                      </span>
                    </div>
                    <button
                      className={styles.addUserButton}
                      onClick={() => handleAddAccompagnateur(accompagnateur)}
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

export default ActivityAccompagnateurs;