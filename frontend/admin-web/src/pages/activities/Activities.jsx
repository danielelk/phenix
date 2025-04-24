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
  const [view, setView] = useState("calendar"); // 'calendar' or 'list'
  const [showForm, setShowForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load activities on component mount and when date/filter changes
  useEffect(() => {
    fetchActivities();
  }, [currentDate, filterType]);

  // Fetch activities for the current month/year
  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Get start and end date for the current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      // Format dates for API
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      // Add type filter if not 'all'
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

  // Handle activity form submission (create/update)
  const handleActivitySubmit = async (activityData) => {
    try {
      if (currentActivity) {
        // Update existing activity
        await activityService.updateActivity(currentActivity.id, activityData);
        toast.success("Activité mise à jour avec succès");
      } else {
        // Create new activity
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

  // Open form to create new activity
  const handleAddActivity = () => {
    setCurrentActivity(null);
    setShowForm(true);
  };

  // Open form to edit activity
  const handleEditActivity = (activity) => {
    setCurrentActivity(activity);
    setShowForm(true);
  };

  // Toggle between calendar and list view
  const toggleView = (newView) => {
    setView(newView);
  };

  // Handle month change in calendar
  const handleMonthChange = (date) => {
    setCurrentDate(date);
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
              currentDate={currentDate}
              onMonthChange={handleMonthChange}
            />
          ) : (
            <div className={styles.listView}>
              {/* List view would be implemented here */}
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
