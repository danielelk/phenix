import React, { useState, useEffect } from "react";
import styles from "./Planning.module.css";
import {
  FiPlus,
  FiCalendar,
  FiClock,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { format, parseISO, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "react-toastify";
import recurringActivityService from "../../services/recurringActivities";
import activityService from "../../services/activities";
import RecurringActivityForm from "../../components/activities/RecurringActivityForm";
import ActivityCalendar from "../../components/activities/ActivityCalendar";

const Planning = () => {
  const [recurringActivities, setRecurringActivities] = useState([]);
  const [activityInstances, setActivityInstances] = useState([]);
  const [selectedRecurringActivity, setSelectedRecurringActivity] =
    useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load recurring activities on component mount
  useEffect(() => {
    fetchRecurringActivities();
  }, []);

  // Fetch recurring activities and their instances
  const fetchRecurringActivities = async () => {
    setLoading(true);
    try {
      const response = await recurringActivityService.getRecurringActivities();
      setRecurringActivities(response.data.recurringActivities || []);

      // Fetch activity instances for the current month
      fetchActivityInstances();
    } catch (error) {
      console.error("Error fetching recurring activities:", error);
      toast.error("Erreur lors du chargement des activités récurrentes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity instances for the calendar view
  const fetchActivityInstances = async () => {
    try {
      // Get start and end date for the current month + next month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = addMonths(startDate, 2);

      // Format dates for API
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      const response = await activityService.getActivitiesByDateRange(
        formattedStartDate,
        formattedEndDate
      );

      setActivityInstances(response.data.activities || []);
    } catch (error) {
      console.error("Error fetching activity instances:", error);
      toast.error("Erreur lors du chargement des instances d'activités");
    }
  };

  // Handle recurring activity form submission
  const handleRecurringActivitySubmit = async (activityData) => {
    try {
      if (selectedRecurringActivity) {
        // Update existing recurring activity
        await recurringActivityService.updateRecurringActivity(
          selectedRecurringActivity.id,
          activityData
        );
        toast.success("Activité récurrente mise à jour avec succès");
      } else {
        // Create new recurring activity
        await recurringActivityService.createRecurringActivity(activityData);
        toast.success("Activité récurrente créée avec succès");
      }

      setShowForm(false);
      fetchRecurringActivities();
    } catch (error) {
      console.error("Error saving recurring activity:", error);
      toast.error("Erreur lors de l'enregistrement de l'activité récurrente");
    }
  };

  // Open form to create new recurring activity
  const handleAddRecurringActivity = () => {
    setSelectedRecurringActivity(null);
    setShowForm(true);
  };

  // Open form to edit recurring activity
  const handleEditRecurringActivity = (activity) => {
    setSelectedRecurringActivity(activity);
    setShowForm(true);
  };

  // Show delete confirmation
  const handleDeleteRecurringActivity = (activity) => {
    setConfirmDelete(activity);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      await recurringActivityService.deleteRecurringActivity(confirmDelete.id);
      setConfirmDelete(null);
      fetchRecurringActivities();
      toast.success("Activité récurrente supprimée avec succès");
    } catch (error) {
      console.error("Error deleting recurring activity:", error);
      toast.error("Erreur lors de la suppression de l'activité récurrente");
    }
  };

  // Regenerate instances for a recurring activity
  const handleRegenerateInstances = async (recurringActivityId) => {
    try {
      // Default to 3 months in the future
      const upToDate = addMonths(new Date(), 3);

      await recurringActivityService.regenerateInstances(recurringActivityId, {
        upToDate: format(upToDate, "yyyy-MM-dd"),
      });

      toast.success("Instances régénérées avec succès");
      fetchActivityInstances();
    } catch (error) {
      console.error("Error regenerating instances:", error);
      toast.error("Erreur lors de la régénération des instances");
    }
  };

  // Toggle calendar view
  const toggleCalendarView = () => {
    setShowCalendar(!showCalendar);
    if (!showCalendar) {
      fetchActivityInstances();
    }
  };

  // Get recurrence type display text
  const getRecurrenceTypeDisplay = (type) => {
    switch (type) {
      case "weekly":
        return "Hebdomadaire";
      case "biweekly":
        return "Bihebdomadaire";
      case "monthly":
        return "Mensuel";
      default:
        return type;
    }
  };

  // Get day of week display text
  const getDayOfWeekDisplay = (day) => {
    const days = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    return days[day] || "";
  };

  return (
    <div className={styles.planningPage}>
      <div className={styles.pageHeader}>
        <h2>Planning des activités récurrentes</h2>
        <div className={styles.headerControls}>
          <button
            className={`${styles.viewButton} ${
              showCalendar ? styles.active : ""
            }`}
            onClick={toggleCalendarView}
            title={showCalendar ? "Vue liste" : "Vue calendrier"}
          >
            <FiCalendar size={18} />
            <span>{showCalendar ? "Vue liste" : "Vue calendrier"}</span>
          </button>

          <button
            className={`btn btn-primary ${styles.addButton}`}
            onClick={handleAddRecurringActivity}
          >
            <FiPlus size={18} /> Ajouter une activité récurrente
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          Chargement des activités récurrentes...
        </div>
      ) : showCalendar ? (
        <div className={styles.calendarContainer}>
          <ActivityCalendar
            activities={activityInstances}
            onEditActivity={() => {}}
            currentDate={currentDate}
            onMonthChange={(date) => {
              setCurrentDate(date);
              fetchActivityInstances();
            }}
          />
        </div>
      ) : (
        <div className={styles.recurringActivitiesList}>
          {recurringActivities.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Aucune activité récurrente trouvée</p>
              <button
                className={`btn btn-primary ${styles.emptyAddButton}`}
                onClick={handleAddRecurringActivity}
              >
                <FiPlus size={18} /> Ajouter une activité récurrente
              </button>
            </div>
          ) : (
            recurringActivities.map((activity) => (
              <div key={activity.id} className={styles.activityCard}>
                <div className={styles.activityInfo}>
                  <h3 className={styles.activityTitle}>{activity.title}</h3>

                  <div className={styles.activityDetails}>
                    <div className={styles.detailItem}>
                      <FiClock size={16} className={styles.detailIcon} />
                      <span>
                        {getDayOfWeekDisplay(activity.day_of_week)} de{" "}
                        {activity.start_time.substring(0, 5)} à{" "}
                        {activity.end_time.substring(0, 5)}
                      </span>
                    </div>

                    <div className={styles.detailItem}>
                      <FiRefreshCw size={16} className={styles.detailIcon} />
                      <span>
                        {getRecurrenceTypeDisplay(activity.recurrence_type)} à
                        partir du{" "}
                        {format(parseISO(activity.start_date), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                        {activity.end_date &&
                          ` jusqu'au ${format(
                            parseISO(activity.end_date),
                            "dd/MM/yyyy",
                            { locale: fr }
                          )}`}
                      </span>
                    </div>

                    <div className={styles.detailItem}>
                      <span className={styles.locationText}>
                        {activity.location}
                      </span>
                    </div>

                    {activity.description && (
                      <div className={styles.description}>
                        {activity.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.activityControls}>
                  <button
                    className={styles.regenerateButton}
                    onClick={() => handleRegenerateInstances(activity.id)}
                    title="Régénérer les instances"
                  >
                    <FiRefreshCw size={18} />
                  </button>

                  <button
                    className={styles.editButton}
                    onClick={() => handleEditRecurringActivity(activity)}
                    title="Modifier"
                  >
                    <FiEdit size={18} />
                  </button>

                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteRecurringActivity(activity)}
                    title="Supprimer"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formContainer}>
            <RecurringActivityForm
              recurringActivity={selectedRecurringActivity}
              onSubmit={handleRecurringActivitySubmit}
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
              Êtes-vous sûr de vouloir supprimer l'activité récurrente "
              {confirmDelete.title}" ?
            </p>
            <p className={styles.confirmWarning}>
              Cela supprimera également toutes les instances futures de cette
              activité.
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

export default Planning;
