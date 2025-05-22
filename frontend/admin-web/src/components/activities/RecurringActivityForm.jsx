import React, { useState, useEffect } from "react";
import styles from "./RecurringActivityForm.module.css";
import { FiX, FiUsers, FiUserCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import userService from "../../services/users";

const RecurringActivityForm = ({ recurringActivity, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    dayOfWeek: 1,
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

  const [participants, setParticipants] = useState([]);
  const [accompagnateurs, setAccompagnateurs] = useState([]);
  const [availableAdherents, setAvailableAdherents] = useState([]);
  const [availableAccompagnateurs, setAvailableAccompagnateurs] = useState([]);
  const [showParticipantsSection, setShowParticipantsSection] = useState(false);
  const [showAccompagnateursSection, setShowAccompagnateursSection] = useState(false);

  const daysOfWeek = [
    { value: 0, label: "Dimanche" },
    { value: 1, label: "Lundi" },
    { value: 2, label: "Mardi" },
    { value: 3, label: "Mercredi" },
    { value: 4, label: "Jeudi" },
    { value: 5, label: "Vendredi" },
    { value: 6, label: "Samedi" },
  ];

  const recurrenceTypes = [
    { value: "weekly", label: "Hebdomadaire" },
    { value: "biweekly", label: "Bimensuelle" },
    { value: "monthly", label: "Mensuelle" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

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

      if (recurringActivity.default_participants) {
        setParticipants(recurringActivity.default_participants);
      }
      if (recurringActivity.default_accompagnateurs) {
        setAccompagnateurs(recurringActivity.default_accompagnateurs);
      }
    }
  }, [recurringActivity]);

  const fetchUsers = async () => {
    try {
      const [adherentsResponse, accompagnateursResponse] = await Promise.all([
        userService.getAdherents(),
        userService.getAccompagnateurs(),
      ]);

      setAvailableAdherents(adherentsResponse.data.adherents || []);
      setAvailableAccompagnateurs(accompagnateursResponse.data.accompagnateurs || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddParticipant = (adherent) => {
    if (!participants.find(p => p.id === adherent.id)) {
      setParticipants(prev => [...prev, adherent]);
    }
  };

  const handleRemoveParticipant = (adherentId) => {
    setParticipants(prev => prev.filter(p => p.id !== adherentId));
  };

  const handleAddAccompagnateur = (accompagnateur) => {
    if (!accompagnateurs.find(a => a.id === accompagnateur.id)) {
      setAccompagnateurs(prev => [...prev, accompagnateur]);
    }
  };

  const handleRemoveAccompagnateur = (accompagnateurId) => {
    setAccompagnateurs(prev => prev.filter(a => a.id !== accompagnateurId));
  };

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

    if (
      formData.transportAvailable &&
      (!formData.transportCapacity || parseInt(formData.transportCapacity) < 1)
    ) {
      toast.error("La capacité de transport doit être au moins 1");
      return false;
    }

    if (
      formData.isPaid &&
      (!formData.price || parseFloat(formData.price) <= 0)
    ) {
      toast.error("Le prix doit être supérieur à 0");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const formattedData = {
        ...formData,
        dayOfWeek: parseInt(formData.dayOfWeek, 10),
        defaultParticipants: participants.map(p => p.id),
        defaultAccompagnateurs: accompagnateurs.map(a => a.id),
      };

      onSubmit(formattedData);
    }
  };

  const getAvailableAdherents = () => {
    return availableAdherents.filter(
      adherent => !participants.find(p => p.id === adherent.id)
    );
  };

  const getAvailableAccompagnateurs = () => {
    return availableAccompagnateurs.filter(
      accompagnateur => !accompagnateurs.find(a => a.id === accompagnateur.id)
    );
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

        {formData.type === "with_adherents" && (
          <div className={styles.participantsSection}>
            <div className={styles.sectionHeader}>
              <h3>Participants par défaut</h3>
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowParticipantsSection(!showParticipantsSection)}
              >
                <FiUsers size={18} />
                {showParticipantsSection ? "Masquer" : "Gérer"} ({participants.length})
              </button>
            </div>

            {showParticipantsSection && (
              <div className={styles.usersManagement}>
                <div className={styles.selectedUsers}>
                  <h4>Participants sélectionnés ({participants.length})</h4>
                  {participants.length === 0 ? (
                    <p className={styles.emptyMessage}>Aucun participant sélectionné</p>
                  ) : (
                    <div className={styles.usersList}>
                      {participants.map(participant => (
                        <div key={participant.id} className={styles.userItem}>
                          <span>{participant.last_name} {participant.first_name}</span>
                          <button
                            type="button"
                            className={styles.removeUserButton}
                            onClick={() => handleRemoveParticipant(participant.id)}
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.availableUsers}>
                  <h4>Adhérents disponibles</h4>
                  <div className={styles.usersList}>
                    {getAvailableAdherents().map(adherent => (
                      <div key={adherent.id} className={styles.userItem}>
                        <span>{adherent.last_name} {adherent.first_name}</span>
                        <button
                          type="button"
                          className={styles.addUserButton}
                          onClick={() => handleAddParticipant(adherent)}
                        >
                          Ajouter
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.accompagnateursSection}>
          <div className={styles.sectionHeader}>
            <h3>Accompagnateurs par défaut</h3>
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowAccompagnateursSection(!showAccompagnateursSection)}
            >
              <FiUserCheck size={18} />
              {showAccompagnateursSection ? "Masquer" : "Gérer"} ({accompagnateurs.length})
            </button>
          </div>

          {showAccompagnateursSection && (
            <div className={styles.usersManagement}>
              <div className={styles.selectedUsers}>
                <h4>Accompagnateurs sélectionnés ({accompagnateurs.length})</h4>
                {accompagnateurs.length === 0 ? (
                  <p className={styles.emptyMessage}>Aucun accompagnateur sélectionné</p>
                ) : (
                  <div className={styles.usersList}>
                    {accompagnateurs.map(accompagnateur => (
                      <div key={accompagnateur.id} className={styles.userItem}>
                        <span>{accompagnateur.last_name} {accompagnateur.first_name}</span>
                        <button
                          type="button"
                          className={styles.removeUserButton}
                          onClick={() => handleRemoveAccompagnateur(accompagnateur.id)}
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.availableUsers}>
                <h4>Accompagnateurs disponibles</h4>
                <div className={styles.usersList}>
                  {getAvailableAccompagnateurs().map(accompagnateur => (
                    <div key={accompagnateur.id} className={styles.userItem}>
                      <span>{accompagnateur.last_name} {accompagnateur.first_name}</span>
                      <button
                        type="button"
                        className={styles.addUserButton}
                        onClick={() => handleAddAccompagnateur(accompagnateur)}
                      >
                        Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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