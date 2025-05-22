import React, { useState, useEffect } from "react";
import styles from "./Activities.module.css";
import { FiPlus, FiCalendar, FiList, FiFilter } from "react-icons/fi";
import { toast } from "react-toastify";
import activityService from "../../services/activities";
import ActivityCalendar from "../../components/activities/ActivityCalendar";
import ActivityForm from "../../components/activities/ActivityForm";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("calendar");
  const [showForm, setShowForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchActivities();
  }, [currentDate, filterType]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      const params = {};
      if (filterType !== "all") {
        params.type = filterType;
      }

      const response = await activityService.getActivitiesByDateRange(
        formattedStartDate,
        formattedEndDate,
        params
      );

      setActivities(response.data.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Erreur lors du chargement des activités");
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySubmit = async (activityData) => {
    try {
      if (currentActivity) {
        await activityService.updateActivity(currentActivity.id, activityData);
        toast.success("Activité mise à jour avec succès");
      } else {
        await activityService.createActivity(activityData);
        toast.success("Activité créée avec succès");
      }

      setShowForm(false);
      fetchActivities();
    } catch (error) {
      console.error("Error saving activity:", error);
      toast.error("Erreur lors de l'enregistrement de l'activité");
    }
  };

  const handleAddActivity = () => {
    setCurrentActivity(null);
    setShowForm(true);
  };

  const handleEditActivity = (activity) => {
    setCurrentActivity(activity);
    setShowForm(true);
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await activityService.deleteActivity(activityId);
      toast.success("Activité supprimée avec succès");
      fetchActivities();
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Erreur lors de la suppression de l'activité");
    }
  };

  const toggleView = (newView) => {
    setView(newView);
  };

  const handleMonthChange = (date) => {
    setCurrentDate(date);
  };

  const handleParticipantsChanged = async (activityId) => {
    // Update only the specific activity in the list instead of refetching everything
    try {
      const updatedActivityResponse = await activityService.getActivityById(activityId);
      const updatedActivity = updatedActivityResponse.data.activity;
      
      // Update the activities list with the new participant count
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === activityId 
            ? { ...activity, participant_count: updatedActivity.participant_count || 0 }
            : activity
        )
      );
    } catch (error) {
      console.error("Error updating activity data:", error);
      // If there's an error, fall back to full refresh
      fetchActivities();
    }
  };

  return (
    <div className={styles.activitiesPage}>
      <div className={styles.pageHeader}>
        <h2>Gestion des activités</h2>
        <div className={styles.headerControls}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${
                view === "calendar" ? styles.active : ""
              }`}
              onClick={() => toggleView("calendar")}
              title="Vue calendrier"
            >
              <FiCalendar size={18} />
              <span>Calendrier</span>
            </button>
            <button
              className={`${styles.viewButton} ${
                view === "list" ? styles.active : ""
              }`}
              onClick={() => toggleView("list")}
              title="Vue liste"
            >
              <FiList size={18} />
              <span>Liste</span>
            </button>
          </div>

          <div className={styles.filterContainer}>
            <FiFilter className={styles.filterIcon} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Tous les types</option>
              <option value="with_adherents">Avec adhérents</option>
              <option value="without_adherents">Sans adhérents</option>
              <option value="br">Bureau Restreint</option>
            </select>
          </div>

          <button
            className={`btn btn-primary ${styles.addButton}`}
            onClick={handleAddActivity}
          >
            <FiPlus size={18} /> Ajouter une activité
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Chargement des activités...</div>
      ) : (
        <div className={styles.contentContainer}>
          {view === "calendar" ? (
            <ActivityCalendar
              activities={activities}
              onEditActivity={handleEditActivity}
              onDeleteActivity={handleDeleteActivity}
              currentDate={currentDate}
              onMonthChange={handleMonthChange}
              onParticipantsChanged={handleParticipantsChanged}
            />
          ) : (
            <div className={styles.listView}>
              <p>Vue liste à implémenter</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formContainer}>
            <ActivityForm
              activity={currentActivity}
              onSubmit={handleActivitySubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;