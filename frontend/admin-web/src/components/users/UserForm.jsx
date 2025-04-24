import React, { useState, useEffect } from "react";
import styles from "./UserForm.module.css";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "accompagnateur",
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalNotes: "",
    isVehiculed: false,
  });

  // If editing an existing user, pre-fill the form
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        phone: user.phone || "",
        role: user.role || "accompagnateur",
        emergencyContactName: user.emergency_contact_name || "",
        emergencyContactPhone: user.emergency_contact_phone || "",
        medicalNotes: user.medical_notes || "",
        isVehiculed: user.is_vehiculed || false,
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error("Le prénom est requis");
      return false;
    }

    if (!formData.lastName.trim()) {
      toast.error("Le nom est requis");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("L'email est requis");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("L'email n'est pas valide");
      return false;
    }

    // Only validate password for new users or if password field is not empty
    if (!user && !formData.password) {
      toast.error("Le mot de passe est requis");
      return false;
    } else if (formData.password && formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return false;
    }

    // Validate emergency contact and medical notes for adherents
    if (formData.role === "adherent") {
      if (!formData.emergencyContactName.trim()) {
        toast.error("Le contact d'urgence est requis");
        return false;
      }

      if (!formData.emergencyContactPhone.trim()) {
        toast.error("Le téléphone du contact d'urgence est requis");
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Remove confirmPassword from submission data
      const { confirmPassword, ...submitData } = formData;

      // If password is empty and editing user, remove it from submission
      if (user && !submitData.password) {
        delete submitData.password;
      }

      onSubmit(submitData);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <h2>{user ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</h2>
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
            />
          </div>
        </div>

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
          />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              {user
                ? "Mot de passe (laisser vide pour conserver)"
                : "Mot de passe *"}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              Rôle *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="admin">Administrateur</option>
              <option value="accompagnateur">Accompagnateur</option>
              <option value="adherent">Adhérent</option>
              <option value="benevole">Bénévole</option>
            </select>
          </div>
        </div>

        {(formData.role === "adherent" || formData.role === "benevole") && (
          <>
            <div className={styles.formDivider} />
            <h3 className={styles.sectionTitle}>
              Informations complémentaires
            </h3>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="emergencyContactName" className={styles.label}>
                  Contact d'urgence *
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className={styles.input}
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
              />
            </div>
          </>
        )}

        {formData.role === "accompagnateur" && (
          <>
            <div className={styles.formDivider} />
            <div className={styles.formGroup}>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="isVehiculed"
                  name="isVehiculed"
                  checked={formData.isVehiculed}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <label htmlFor="isVehiculed" className={styles.checkboxLabel}>
                  Cet accompagnateur possède un véhicule
                </label>
              </div>
            </div>
          </>
        )}

        <div className={styles.formFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Annuler
          </button>
          <button type="submit" className={styles.submitButton}>
            {user ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
