import React, { useState, useEffect } from "react";
import styles from "./RecurringActivityForm.module.css";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";

const RecurringActivityForm = ({ recurringActivity, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    dayOfWeek: 1, // Monday
    startTime: "09:00",
    endTime: "10:00",
    recurrenceType: "weekly",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    type: "with_adherents",
    maxParticipants: "",
    transportAvailable: false,
    transportCapacity: "",
    isPaid: false,
    price: "",
    regenerateInstances: true,
  });

  // Days of the week
  const daysOfWeek = [
    { value: 0, label: "Dimanche" },
    { value: 1, label: "Lundi" },
    { value: 2, label: "Mardi" },
    { value: 3, label: "Mercredi" },
    { value: 4, label: "Jeudi" },
    { value: 5, label: "Vendredi" },
    { value: 6, label: "Samedi" },
  ];

  // Recurrence types
  const recurrenceTypes = [
    { value: "weekly", label: "Hebdomadaire" },
    { value: "biweekly", label: "Bimensuelle" },
    { value: "monthly", label: "Mensuelle" },
  ];

  // If editing an existing recurring activity, pre-fill the form
  useEffect(() => {
    if (recurringActivity) {
      setFormData({
        title: recurringActivity.title || "",
        description: recurringActivity.description || "",
        location: recurringActivity.location || "",
        dayOfWeek: recurringActivity.day_of_week ?? 1,
        startTime: recurringActivity.start_time || "09:00",
        endTime: recurringActivity.end_time || "10:00",
        recurrenceType: recurringActivity.recurrence_type || "weekly",
        startDate: recurringActivity.start_date
          ? format(new Date(recurringActivity.start_date), "yyyy-MM-dd")
          : "",
        endDate: recurringActivity.end_date
          ? format(new Date(recurringActivity.end_date), "yyyy-MM-dd")
          : "",
        type: recurringActivity.type || "with_adherents",
        maxParticipants: recurringActivity.max_participants || "",
        transportAvailable: recurringActivity.transport_available || false,
        transportCapacity: recurringActivity.transport_capacity || "",
        isPaid: recurringActivity.is_paid || false,
        price: recurringActivity.price
          ? recurringActivity.price.toString()
          : "",
        regenerateInstances: true,
      });
    }
  }, [recurringActivity]);

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

    if (!formData.location.trim()) {
      toast.error("Le lieu est requis");
      return false;
    }

    if (!formData.startTime) {
      toast.error("L'heure de début est requise");
      return false;
    }

    if (!formData.endTime) {
      toast.error("L'heure de fin est requise");
      return false;
    }

    if (!formData.startDate) {
      toast.error("La date de début est requise");
      return false;
    }

    // Check if start time is before end time
    const startTime = formData.startTime.split(":");
    const endTime = formData.endTime.split(":");
    const startHour = parseInt(startTime[0], 10);
    const startMinute = parseInt(startTime[1], 10);
    const endHour = parseInt(endTime[0], 10);
    const endMinute = parseInt(endTime[1], 10);

    if (
      startHour > endHour ||
      (startHour === endHour && startMinute >= endMinute)
    ) {
      toast.error("L'heure de fin doit être après l'heure de début");
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

    // Validate price if activity is paid
    if (
      formData.isPaid &&
      (!formData.price || parseFloat(formData.price) <= 0)
    ) {
      toast.error("Le prix doit être supérieur à 0");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Convert dayOfWeek to integer
      const formattedData = {
        ...formData,
        dayOfWeek: parseInt(formData.dayOfWeek, 10),
      };

      onSubmit(formattedData);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formHeader}>
        <h2>
          {recurringActivity
            ? "Modifier l'activité récurrente"
            : "Ajouter une activité récurrente"}
        </h2>
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
            placeholder="Titre de l'activité récurrente"
          />
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
            <label htmlFor="dayOfWeek" className={styles.label}>
              Jour de la semaine *
            </label>
            <select
              id="dayOfWeek"
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleChange}
              className={styles.select}
            >
              {daysOfWeek.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="recurrenceType" className={styles.label}>
              Type de récurrence *
            </label>
            <select
              id="recurrenceType"
              name="recurrenceType"
              value={formData.recurrenceType}
              onChange={handleChange}
              className={styles.select}
            >
              {recurrenceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGrid}>
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
            <label htmlFor="endDate" className={styles.label}>
              Date de fin (optionnel)
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={styles.input}
              placeholder="Laissez vide pour une récurrence sans fin"
            />
          </div>
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
              <option value="br">Bureau Restreint</option>
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
          <>
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
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="isPaid"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <label htmlFor="isPaid" className={styles.checkboxLabel}>
                  Activité payante
                </label>
              </div>
            </div>

            {formData.isPaid && (
              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>
                  Prix (€) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={styles.input}
                  min="0.01"
                  step="0.01"
                  placeholder="Prix de l'activité"
                />
              </div>
            )}
          </>
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

        {recurringActivity && (
          <div className={styles.formGroup}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="regenerateInstances"
                name="regenerateInstances"
                checked={formData.regenerateInstances}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <label
                htmlFor="regenerateInstances"
                className={styles.checkboxLabel}
              >
                Régénérer les instances futures
              </label>
              <p className={styles.helpText}>
                Si activé, les instances futures de cette activité récurrente
                seront régénérées selon les nouvelles informations.
              </p>
            </div>
          </div>
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
            {recurringActivity ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecurringActivityForm;