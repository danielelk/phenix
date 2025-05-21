import React, { useState, useEffect } from "react";
import styles from "./AdherentRegistrationForm.module.css";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import membershipService from "../../services/membership";
import formulesService from "../../services/formules";

const AdherentRegistrationForm = ({ onSubmit, onCancel }) => {
  const [formules, setFormules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    genre: "masculin", // Valeur par défaut
    nationalite: "",
    formuleId: "",
    estBenevole: false,
    inscriptionSport: false,
    inscriptionLoisirs: false,
    autorisationImage: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalNotes: "",
    address: "",
    city: "",
    postalCode: "",
    dateOfBirth: "",
  });

  // Chargement des formules disponibles
  useEffect(() => {
    const fetchFormules = async () => {
      try {
        const response = await formulesService.getFormules();
        setFormules(response.data.formules.filter(formule => formule.est_actif));
      } catch (error) {
        console.error("Erreur lors du chargement des formules:", error);
        toast.error("Erreur lors du chargement des formules");
      }
    };

    fetchFormules();
  }, []);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    // Si on coche la case bénévole, on réinitialise les choix sport/loisirs
    if (name === "estBenevole" && checked) {
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        inscriptionSport: false,
        inscriptionLoisirs: false,
        formuleId: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const requiredFields = [
      "firstName", 
      "lastName", 
      "email", 
      "phone", 
      "genre", 
      "nationalite"
    ];

    // Ajout des champs obligatoires pour les adhérents (non bénévoles)
    if (!formData.estBenevole) {
      requiredFields.push("formuleId");
      requiredFields.push("emergencyContactName");
      requiredFields.push("emergencyContactPhone");
    }

    // Vérification des champs requis
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Le champ ${getFieldLabel(field)} est requis`);
        return false;
      }
    }

    // Validation de l'email
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("L'adresse email n'est pas valide");
      return false;
    }

    // Validation du numéro de téléphone (format français)
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Le numéro de téléphone n'est pas valide");
      return false;
    }

    // Validation pour les adhérents non bénévoles
    if (!formData.estBenevole) {
      if (!formData.inscriptionSport && !formData.inscriptionLoisirs) {
        toast.error("Veuillez sélectionner au moins une option: Sport ou Loisirs");
        return false;
      }
    }

    return true;
  };

  // Conversion du nom de champ en libellé pour les messages d'erreur
  const getFieldLabel = (field) => {
    const fieldLabels = {
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phone: "Téléphone",
      genre: "Genre",
      nationalite: "Nationalité",
      formuleId: "Formule d'adhésion",
      emergencyContactName: "Contact d'urgence",
      emergencyContactPhone: "Téléphone d'urgence"
    };
    return fieldLabels[field] || field;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await membershipService.createMembershipRequest(formData);
      
      toast.success("Demande d'adhésion envoyée avec succès");
      
      // Vérifier si onSubmit existe et est une fonction avant de l'appeler
      if (typeof onSubmit === 'function') {
        onSubmit(result);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande d'adhésion:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi de la demande d'adhésion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <h2>Demande d'adhésion</h2>
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
        <div className={styles.statusInfo}>
          <FiAlertCircle size={20} />
          <p>
            Cette demande sera soumise à l'administration de l'association pour validation.
            Vous recevrez une confirmation par email.
          </p>
        </div>

        {/* Type de membre */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Type d'inscription</h3>
          
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="estBenevole"
              name="estBenevole"
              checked={formData.estBenevole}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <label htmlFor="estBenevole" className={styles.checkboxLabel}>
              Je souhaite devenir bénévole
            </label>
          </div>

          {!formData.estBenevole && (
            <div className={styles.formOptionGroup}>
              <p className={styles.optionLabel}>Je souhaite m'inscrire aux activités :</p>
              <div className={styles.optionSelections}>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="inscriptionSport"
                    name="inscriptionSport"
                    checked={formData.inscriptionSport}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <label htmlFor="inscriptionSport" className={styles.checkboxLabel}>
                    Sport
                  </label>
                </div>
                
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="inscriptionLoisirs"
                    name="inscriptionLoisirs"
                    checked={formData.inscriptionLoisirs}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <label htmlFor="inscriptionLoisirs" className={styles.checkboxLabel}>
                    Loisirs
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informations personnelles */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Informations personnelles</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                Prénom *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Nom *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                Téléphone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={styles.input}
                placeholder="0612345678"
                required
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="genre" className={styles.label}>
                Genre *
              </label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="masculin">Masculin</option>
                <option value="feminin">Féminin</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nationalite" className={styles.label}>
                Nationalité *
              </label>
              <input
                type="text"
                id="nationalite"
                name="nationalite"
                value={formData.nationalite}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth" className={styles.label}>
                Date de naissance
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address" className={styles.label}>
                Adresse
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="city" className={styles.label}>
                Ville
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="postalCode" className={styles.label}>
                Code Postal
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Formule d'adhésion - seulement pour les adhérents */}
        {!formData.estBenevole && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Formule d'adhésion</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="formuleId" className={styles.label}>
                Sélectionnez une formule *
              </label>
              <select
                id="formuleId"
                name="formuleId"
                value={formData.formuleId}
                onChange={handleChange}
                className={styles.select}
                required={!formData.estBenevole}
              >
                <option value="">Sélectionner une formule</option>
                {formules.map(formule => (
                  <option key={formule.id} value={formule.id}>
                    {formule.titre} - {formule.prix}€
                  </option>
                ))}
              </select>
              
              {formData.formuleId && formules.length > 0 && (
                <div className={styles.formuleDescription}>
                  {formules.find(f => f.id.toString() === formData.formuleId.toString())?.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informations d'urgence - seulement pour les adhérents */}
        {!formData.estBenevole && (
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Informations d'urgence</h3>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="emergencyContactName" className={styles.label}>
                  Personne à contacter en cas d'urgence *
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className={styles.input}
                  required={!formData.estBenevole}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="emergencyContactPhone" className={styles.label}>
                  Téléphone d'urgence *
                </label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0612345678"
                  required={!formData.estBenevole}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="medicalNotes" className={styles.label}>
                Informations médicales importantes
              </label>
              <textarea
                id="medicalNotes"
                name="medicalNotes"
                value={formData.medicalNotes}
                onChange={handleChange}
                className={styles.textarea}
                rows="3"
                placeholder="Allergies, maladies chroniques, traitements en cours, etc."
              />
            </div>
          </div>
        )}

        {/* Autorisation d'utilisation d'image */}
        <div className={styles.formSection}>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="autorisationImage"
              name="autorisationImage"
              checked={formData.autorisationImage}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <label htmlFor="autorisationImage" className={`${styles.checkboxLabel} ${styles.legalText}`}>
              J'autorise l'association à utiliser mon image pour la promotion de ses activités 
              (site internet, réseaux sociaux, affiches, etc.)
            </label>
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
            {loading ? "Envoi en cours..." : "Envoyer la demande"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdherentRegistrationForm;