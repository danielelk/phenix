import React, { useState, useEffect } from "react";
import styles from "./ActivityForm.module.css";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

const ActivityForm = ({ activity, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    type: "with_adherents",
    maxParticipants: "",
    transportAvailable: false,
    transportCapacity: "",
  });

  // If editing an existing activity, pre-fill the form
  useEffect(() => {
    if (activity) {
      const startDate = parseISO(activity.start_date);
      const endDate = parseISO(activity.end_date);

      setFormData({
        title: activity.title || "",
        description: activity.description || "",
        startDate: format(startDate, "yyyy-MM-dd"),
        startTime: format(startDate, "HH:mm"),
        endDate: format(endDate, "yyyy-MM-dd"),
        endTime: format(endDate, "HH:mm"),
        location: activity.location || "",
        type: activity.type || "with_adherents",
        maxParticipants: activity.max_participants || "",
        transportAvailable: activity.transport_available || false,
        transportCapacity: activity.transport_capacity || "",
      });
    } else {
      // For new activities, set default start/end to current date
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      setFormData((prev) => ({
        ...prev,
        startDate: format(now, "yyyy-MM-dd"),
        startTime: format(now, "HH:mm"),
        endDate: format(now, "yyyy-MM-dd"),
        endTime: format(oneHourLater, "HH:mm"),
      }));
    }
  }, [activity]);

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
    if (!formData.title.trim()) {
      toast.error("Le titre est requis");
      return false;
    }

    if (!formData.startDate) {
      toast.error("La date de début est requise");
      return false;
    }

    if (!formData.startTime) {
      toast.error("L'heure de début est requise");
      return false;
    }

    if (!formData.endDate) {
      toast.error("La date de fin est requise");
      return false;
    }

    if (!formData.endTime) {
      toast.error("L'heure de fin est requise");
      return false;
    }

    if (!formData.location.trim()) {
      toast.error("Le lieu est requis");
      return false;
    }

    // Check if end datetime is after start datetime
    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`
    );
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error(
        "La date/heure de fin doit être après la date/heure de début"
      );
      return false;
    }

    // Validate transport capacity if transport is available
    if (
      formData.transportAvailable &&
      (!formData.transportCapacity || parseInt(formData.transportCapacity) < 1)
    ) {
      toast.error("La capacité de transport doit être au moins 1");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Combine date and time fields
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      );
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      // Prepare data for submission
      const activityData = {
        title: formData.title,
        description: formData.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        location: formData.location,
        type: formData.type,
        maxParticipants: formData.maxParticipants
          ? parseInt(formData.maxParticipants)
          : null,
        transportAvailable: formData.transportAvailable,
        transportCapacity:
          formData.transportAvailable && formData.transportCapacity
            ? parseInt(formData.transportCapacity)
            : 0,
      };

      onSubmit(activityData);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <h2>{activity ? "Modifier l'activité" : "Ajouter une activité"}</h2>
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
          <label htmlFor="title" className={styles.label}>
            Titre *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.input}
            placeholder="Titre de l'activité"
          />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate" className={styles.label}>
              Date de début *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="startTime" className={styles.label}>
              Heure de début *
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="endDate" className={styles.label}>
              Date de fin *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endTime" className={styles.label}>
              Heure de fin *
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location" className={styles.label}>
            Lieu *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={styles.input}
            placeholder="Adresse ou lieu de l'activité"
          />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>
              Type d'activité *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="with_adherents">Avec adhérents</option>
              <option value="without_adherents">Sans adhérents</option>
            </select>
          </div>

          {formData.type === "with_adherents" && (
            <div className={styles.formGroup}>
              <label htmlFor="maxParticipants" className={styles.label}>
                Nombre maximum de participants
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                className={styles.input}
                min="1"
                placeholder="Illimité si vide"
              />
            </div>
          )}
        </div>

        {formData.type === "with_adherents" && (
          <div className={styles.formGroup}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="transportAvailable"
                name="transportAvailable"
                checked={formData.transportAvailable}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <label
                htmlFor="transportAvailable"
                className={styles.checkboxLabel}
              >
                Transport disponible pour cette activité
              </label>
            </div>
          </div>
        )}

        {formData.transportAvailable && (
          <div className={styles.formGroup}>
            <label htmlFor="transportCapacity" className={styles.label}>
              Capacité de transport *
            </label>
            <input
              type="number"
              id="transportCapacity"
              name="transportCapacity"
              value={formData.transportCapacity}
              onChange={handleChange}
              className={styles.input}
              min="1"
              placeholder="Nombre de places disponibles"
            />
          </div>
        )}

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
            placeholder="Description de l'activité"
          />
        </div>

        <div className={styles.formFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Annuler
          </button>
          <button type="submit" className={styles.submitButton}>
            {activity ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;
