import React, { useState } from "react";
import styles from "./FormuleForm.module.css";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";

const FormuleForm = ({ formule, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    titre: formule?.titre || "",
    description: formule?.description || "",
    prix: formule?.prix || "",
    estActif: formule ? formule.est_actif : true
  });

  const [loading, setLoading] = useState(false);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === "prix") {
      // Validation pour n'accepter que des chiffres et un point decimal
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === "" || regex.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    if (!formData.titre.trim()) {
      toast.error("Le titre est requis");
      return false;
    }

    if (!formData.prix) {
      toast.error("Le prix est requis");
      return false;
    }

    const price = parseFloat(formData.prix);
    if (isNaN(price) || price <= 0) {
      toast.error("Le prix doit être un nombre positif");
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Conversion du prix en nombre
      const submitData = {
        ...formData,
        prix: parseFloat(formData.prix)
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <h2>{formule ? "Modifier la formule" : "Ajouter une formule"}</h2>
        <button
          className={styles.closeButton}
          onClick={onCancel}
          type="button"
          aria-label="Fermer"
        >
          <FiX size={24} />
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="titre" className={styles.label}>
            Titre *
          </label>
          <input
            type="text"
            id="titre"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            className={styles.input}
            placeholder="Nom de la formule"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.textarea}
            rows="4"
            placeholder="Description détaillée de la formule (optionnel)"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="prix" className={styles.label}>
            Prix (€) *
          </label>
          <input
            type="text"
            id="prix"
            name="prix"
            value={formData.prix}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ex: 150.00"
            required
          />
          <div className={styles.inputInfo}>
            Utilisez un point comme séparateur décimal (Ex: 150.50)
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="estActif"
            name="estActif"
            checked={formData.estActif}
            onChange={handleChange}
            className={styles.checkbox}
          />
          <label htmlFor="estActif" className={styles.checkboxLabel}>
            Formule active
          </label>
          <div className={styles.checkboxHelper}>
            Les formules inactives ne seront pas proposées aux nouveaux adhérents
          </div>
        </div>

        <div className={styles.formFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : formule ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormuleForm;