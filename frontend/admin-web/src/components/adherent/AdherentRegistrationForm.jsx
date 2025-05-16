import React, { useState, useEffect } from "react";
import styles from "./AdherentRegistrationForm.module.css";
import { FiUser, FiMail, FiPhone, FiSave, FiAlertTriangle, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import { format } from "date-fns";
import api from "../../services/api";

const AdherentRegistrationForm = () => {
  const [formules, setFormules] = useState([]);
  const [loadingFormules, setLoadingFormules] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    city: "",
    postalCode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalNotes: "",
    genre: "",
    nationalite: "",
    formuleId: "",
    estBenevole: false,
    inscriptionSport: false,
    inscriptionLoisirs: false,
    autorisationImage: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Charger les formules disponibles
  useEffect(() => {
    const fetchFormules = async () => {
      try {
        const response = await api.get("/formules/public");
        setFormules(response.data.formules || []);
      } catch (error) {
        console.error("Erreur lors du chargement des formules:", error);
        // Formules par défaut en cas d'erreur
        setFormules([
          {
            id: 1,
            titre: "Formule Standard",
            description: "Accès aux activités régulières de l'association",
            prix: 150.00,
          },
          {
            id: 2,
            titre: "Formule Loisirs",
            description: "Accès aux sorties loisirs et événements spéciaux",
            prix: 100.00,
          },
          {
            id: 3,
            titre: "Formule Complète",
            description: "Accès à toutes les activités (sport et loisirs)",
            prix: 200.00,
          }
        ]);
      } finally {
        setLoadingFormules(false);
      }
    };

    fetchFormules();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      // Si on passe à bénévole, réinitialiser certains champs
      if (name === "estBenevole" && checked) {
        return {
          ...prev,
          [name]: checked,
          formuleId: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
        };
      }
      // Pour tous les autres champs
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    }

    if (!formData.genre) {
      newErrors.genre = "Le genre est requis";
    }

    if (!formData.nationalite.trim()) {
      newErrors.nationalite = "La nationalité est requise";
    }

    // Validation spécifique pour les adhérents (non bénévoles)
    if (!formData.estBenevole) {
      if (!formData.emergencyContactName.trim()) {
        newErrors.emergencyContactName = "Le contact d'urgence est requis";
      }
  
      if (!formData.emergencyContactPhone.trim()) {
        newErrors.emergencyContactPhone = "Le téléphone du contact d'urgence est requis";
      }

      if (!formData.formuleId) {
        newErrors.formuleId = "Veuillez sélectionner une formule";
      }
      
      if (!formData.inscriptionSport && !formData.inscriptionLoisirs) {
        newErrors.inscriptionSport = "Veuillez sélectionner au moins une option";
        newErrors.inscriptionLoisirs = "Veuillez sélectionner au moins une option";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector(`.${styles.error}`);
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for the API
      const membershipData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate || null,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        emergencyContactName: formData.estBenevole ? null : formData.emergencyContactName,
        emergencyContactPhone: formData.estBenevole ? null : formData.emergencyContactPhone,
        medicalNotes: formData.medicalNotes,
        genre: formData.genre,
        nationalite: formData.nationalite,
        formuleId: formData.estBenevole ? null : formData.formuleId,
        estBenevole: formData.estBenevole,
        inscriptionSport: formData.inscriptionSport,
        inscriptionLoisirs: formData.inscriptionLoisirs,
        autorisationImage: formData.autorisationImage,
        registrationDate: format(new Date(), "yyyy-MM-dd"),
      };

      // Submit the form without authorization token (public endpoint)
      await api.post("/public/membership-requests", membershipData);

      // Clear form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
        address: "",
        city: "",
        postalCode: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        medicalNotes: "",
        genre: "",
        nationalite: "",
        formuleId: "",
        estBenevole: false,
        inscriptionSport: false,
        inscriptionLoisirs: false,
        autorisationImage: false,
      });

      setSuccessMessage(
        formData.estBenevole 
          ? "Votre demande de bénévolat a été envoyée avec succès. Nous vous contacterons prochainement."
          : "Votre demande d'adhésion a été envoyée avec succès. Nous vous contacterons prochainement."
      );
      toast.success("Demande envoyée avec succès");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get formule info
  const getFormuleInfo = (id) => {
    const formule = formules.find(f => f.id === parseInt(id));
    return formule || null;
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <img src="/logo.svg" alt="Association Phénix" className={styles.logo} />
        <h1 className={styles.title}>Association Phénix</h1>
        <h2 className={styles.subtitle}>Demande d'adhésion</h2>
      </div>

      {successMessage ? (
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✓</div>
          <h3 className={styles.successTitle}>Demande envoyée !</h3>
          <p className={styles.successMessage}>{successMessage}</p>
          <button 
            className={styles.newRequestButton}
            onClick={() => setSuccessMessage("")}
          >
            Faire une nouvelle demande
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.benevoleSwitch}>
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
                Je souhaite devenir bénévole (et non adhérent)
              </label>
            </div>
          </div>
          
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Informations personnelles</h3>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.label}>
                  Prénom *
                </label>
                <div className={styles.inputWithIcon}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
                    placeholder="Votre prénom"
                  />
                </div>
                {errors.firstName && (
                  <p className={styles.error}>{errors.firstName}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>
                  Nom *
                </label>
                <div className={styles.inputWithIcon}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}
                    placeholder="Votre nom"
                  />
                </div>
                {errors.lastName && (
                  <p className={styles.error}>{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email *
                </label>
                <div className={styles.inputWithIcon}>
                  <FiMail className={styles.inputIcon} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    placeholder="Votre adresse email"
                  />
                </div>
                {errors.email && (
                  <p className={styles.error}>{errors.email}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Téléphone *
                </label>
                <div className={styles.inputWithIcon}>
                  <FiPhone className={styles.inputIcon} />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
                {errors.phone && (
                  <p className={styles.error}>{errors.phone}</p>
                )}
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
                  className={`${styles.select} ${errors.genre ? styles.inputError : ""}`}
                >
                  <option value="">Sélectionnez</option>
                  <option value="masculin">Masculin</option>
                  <option value="feminin">Féminin</option>
                </select>
                {errors.genre && (
                  <p className={styles.error}>{errors.genre}</p>
                )}
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
                  className={`${styles.input} ${errors.nationalite ? styles.inputError : ""}`}
                  placeholder="Votre nationalité"
                />
                {errors.nationalite && (
                  <p className={styles.error}>{errors.nationalite}</p>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="birthDate" className={styles.label}>
                Date de naissance
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
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
                placeholder="Votre adresse"
              />
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
                  placeholder="Votre ville"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="postalCode" className={styles.label}>
                  Code postal
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Votre code postal"
                />
              </div>
            </div>
          </div>

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
                    className={`${styles.input} ${errors.emergencyContactName ? styles.inputError : ""}`}
                    placeholder="Nom et prénom"
                  />
                  {errors.emergencyContactName && (
                    <p className={styles.error}>{errors.emergencyContactName}</p>
                  )}
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
                    className={`${styles.input} ${errors.emergencyContactPhone ? styles.inputError : ""}`}
                    placeholder="Numéro de téléphone"
                  />
                  {errors.emergencyContactPhone && (
                    <p className={styles.error}>{errors.emergencyContactPhone}</p>
                  )}
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
                  placeholder="Allergies, traitements médicaux, etc."
                  rows="3"
                />
              </div>
            </div>
          )}

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              {formData.estBenevole ? "Informations de bénévolat" : "Informations d'adhésion"}
            </h3>
            
            {!formData.estBenevole && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="formuleId" className={styles.label}>
                    Formule d'adhésion *
                  </label>
                  <select
                    id="formuleId"
                    name="formuleId"
                    value={formData.formuleId}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.formuleId ? styles.inputError : ""}`}
                    disabled={loadingFormules}
                  >
                    <option value="">Sélectionnez une formule</option>
                    {formules.map((formule) => (
                      <option key={formule.id} value={formule.id}>
                        {formule.titre} - {formule.prix}€
                      </option>
                    ))}
                  </select>
                  {errors.formuleId && (
                    <p className={styles.error}>{errors.formuleId}</p>
                  )}
                  
                  {formData.formuleId && (
                    <div className={styles.formuleDetail}>
                      {getFormuleInfo(formData.formuleId)?.description}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Je m'inscris pour... *
              </label>
              <div className={styles.checkboxGroupContainer}>
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
                    Le sport
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
                    Les sorties loisirs
                  </label>
                </div>
              </div>
              {(errors.inscriptionSport || errors.inscriptionLoisirs) && (
                <p className={styles.error}>Veuillez sélectionner au moins une option</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="autorisationImage"
                  name="autorisationImage"
                  checked={formData.autorisationImage}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <label htmlFor="autorisationImage" className={styles.checkboxLabel}>
                  Je donne l'autorisation d'utiliser mon image (presse, web, réseaux sociaux, documentation interne à l'association)
                </label>
              </div>
            </div>

            {!formData.estBenevole && (
              <div className={styles.infoBox}>
                <div className={styles.infoHeader}>
                  <FiAlertTriangle className={styles.infoIcon} />
                  <h4 className={styles.infoTitle}>Information</h4>
                </div>
                <p className={styles.infoText}>
                  Après validation de votre demande d'adhésion, vous serez contacté pour finaliser votre inscription et régler votre cotisation.
                </p>
              </div>
            )}
          </div>

          <div className={styles.formFooter}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.loadingText}>Envoi en cours...</span>
              ) : (
                <>
                  <FiSave className={styles.buttonIcon} />
                  <span>
                    {formData.estBenevole 
                      ? "Envoyer ma demande de bénévolat" 
                      : "Envoyer ma demande d'adhésion"}
                  </span>
                </>
              )}
            </button>
          </div>

          <p className={styles.requiredFieldsNote}>* Champs obligatoires</p>
        </form>
      )}
    </div>
  );
};

export default AdherentRegistrationForm;