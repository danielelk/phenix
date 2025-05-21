import React, { useState, useEffect } from "react";
import styles from "./FormuleList.module.css";
import { FiPlus, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { toast } from "react-toastify";
import formulesService from "../../services/formules";
import FormuleForm from "./FormuleForm";

const FormuleList = () => {
  const [formules, setFormules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentFormule, setCurrentFormule] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Chargement des formules
  useEffect(() => {
    fetchFormules();
  }, []);

  // Récupération des formules
  const fetchFormules = async () => {
    setLoading(true);
    try {
      const response = await formulesService.getFormules();
      setFormules(response.data.formules || []);
    } catch (error) {
      console.error("Erreur lors du chargement des formules:", error);
      toast.error("Erreur lors du chargement des formules");
    } finally {
      setLoading(false);
    }
  };

  // Ouverture du formulaire pour ajouter une formule
  const handleAddFormule = () => {
    setCurrentFormule(null);
    setShowForm(true);
  };

  // Ouverture du formulaire pour modifier une formule
  const handleEditFormule = (formule) => {
    setCurrentFormule(formule);
    setShowForm(true);
  };

  // Soumission du formulaire
  const handleFormuleSubmit = async (formuleData) => {
    try {
      if (currentFormule) {
        // Mise à jour d'une formule existante
        await formulesService.updateFormule(currentFormule.id, formuleData);
        toast.success("Formule mise à jour avec succès");
      } else {
        // Création d'une nouvelle formule
        await formulesService.createFormule(formuleData);
        toast.success("Formule créée avec succès");
      }

      setShowForm(false);
      fetchFormules();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la formule:", error);
      toast.error("Erreur lors de l'enregistrement de la formule");
    }
  };

  // Activation/désactivation d'une formule
  const handleToggleActive = async (formule) => {
    try {
      await formulesService.updateFormule(formule.id, {
        estActif: !formule.est_actif
      });
      
      // Mise à jour locale de l'état
      setFormules(formules.map(f => 
        f.id === formule.id ? { ...f, est_actif: !f.est_actif } : f
      ));
      
      toast.success(`Formule ${formule.est_actif ? 'désactivée' : 'activée'} avec succès`);
    } catch (error) {
      console.error("Erreur lors de la modification du statut:", error);
      toast.error("Erreur lors de la modification du statut");
    }
  };

  // Confirmation de suppression
  const handleDeleteFormule = (formule) => {
    setConfirmDelete(formule);
  };

  // Annulation de la suppression
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Suppression d'une formule
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      await formulesService.deleteFormule(confirmDelete.id);
      setConfirmDelete(null);
      fetchFormules();
      toast.success("Formule supprimée avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de la formule:", error);
      
      // Message d'erreur spécifique si la formule est utilisée par des adhérents
      if (error.response?.status === 409) {
        toast.error("Impossible de supprimer cette formule car elle est utilisée par des adhérents");
      } else {
        toast.error("Erreur lors de la suppression de la formule");
      }
    }
  };

  return (
    <div className={styles.formuleListPage}>
      <div className={styles.pageHeader}>
        <h2>Gestion des formules d'adhésion</h2>
        <button 
          className={`btn btn-primary ${styles.addButton}`}
          onClick={handleAddFormule}
        >
          <FiPlus size={18} /> Ajouter une formule
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Chargement des formules...</div>
      ) : (
        <div className={styles.formuleList}>
          {formules.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Aucune formule d'adhésion n'a été créée</p>
              <button 
                className={`btn btn-primary ${styles.emptyAddButton}`}
                onClick={handleAddFormule}
              >
                <FiPlus size={18} /> Ajouter une formule
              </button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.formulesTable}>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Description</th>
                    <th>Prix (€)</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formules.map((formule) => (
                    <tr key={formule.id} className={!formule.est_actif ? styles.inactiveRow : ''}>
                      <td className={styles.titleCell}>{formule.titre}</td>
                      <td className={styles.descriptionCell}>
                        {formule.description || <span className={styles.noData}>Aucune description</span>}
                      </td>
                      <td className={styles.priceCell}>{formule.prix}€</td>
                      <td className={styles.statusCell}>
                        <span className={formule.est_actif ? styles.activeStatus : styles.inactiveStatus}>
                          {formule.est_actif ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleToggleActive(formule)}
                          title={formule.est_actif ? "Désactiver" : "Activer"}
                        >
                          {formule.est_actif ? (
                            <FiToggleRight size={18} className={styles.activeIcon} />
                          ) : (
                            <FiToggleLeft size={18} className={styles.inactiveIcon} />
                          )}
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleEditFormule(formule)}
                          title="Modifier"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDeleteFormule(formule)}
                          title="Supprimer"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formContainer}>
            <FormuleForm
              formule={currentFormule}
              onSubmit={handleFormuleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <h3>Confirmer la suppression</h3>
            <p>
              Êtes-vous sûr de vouloir supprimer la formule "{confirmDelete.titre}" ?
            </p>
            <p className={styles.confirmWarning}>
              Cette action est irréversible. Si des adhérents utilisent cette formule, 
              la suppression ne sera pas possible.
            </p>
            <div className={styles.confirmButtons}>
              <button
                className={styles.cancelButton}
                onClick={handleCancelDelete}
              >
                Annuler
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmDelete}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormuleList;