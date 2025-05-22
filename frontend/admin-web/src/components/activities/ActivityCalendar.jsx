import React, { useState } from "react";
import styles from "./ActivityCalendar.module.css";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiUsers,
  FiClock,
  FiMapPin,
  FiBriefcase,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";
import { MdOutlineEuroSymbol } from "react-icons/md";
import ActivityParticipants from "./ActivityParticipants";
import ActivityAccompagnateurs from "./ActivityAccompagnateurs";

const ActivityCalendar = ({
  activities,
  onEditActivity,
  onDeleteActivity,
  currentDate,
  onMonthChange,
  onParticipantsChanged,
}) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showAccompagnateurs, setShowAccompagnateurs] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const previousMonth = () => {
    onMonthChange(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    onMonthChange(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    onMonthChange(new Date());
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  const getFirstDayOfMonth = () => {
    return startOfMonth(currentDate).getDay();
  };

  const getActivitiesForDay = (day) => {
    return activities.filter((activity) =>
      isSameDay(parseISO(activity.start_date), day)
    );
  };

  const getActivityTypeClass = (activityType) => {
    switch(activityType) {
      case "with_adherents":
        return styles.withAdherentsActivity;
      case "without_adherents":
        return styles.withoutAdherentsActivity;
      case "br":
        return styles.brActivity;
      default:
        return styles.withoutAdherentsActivity;
    }
  };

  const renderActivity = (activity) => {
    const typeClass = getActivityTypeClass(activity.type);

    return (
      <div
        key={activity.id}
        className={`${styles.activityItem} ${typeClass}`}
        onClick={() => setSelectedActivity(activity)}
      >
        <div className={styles.activityTime}>
          {format(parseISO(activity.start_date), "HH:mm")}
        </div>
        <div className={styles.activityTitle}>{activity.title}</div>
      </div>
    );
  };

  const handleManageParticipants = () => {
    if (selectedActivity && selectedActivity.type === "with_adherents") {
      setShowParticipants(true);
    }
  };

  const handleManageAccompagnateurs = () => {
    if (selectedActivity) {
      setShowAccompagnateurs(true);
    }
  };

  const handleParticipantsChanged = () => {
    // Don't trigger a full refresh from parent, just update the selected activity data locally
    if (selectedActivity && onParticipantsChanged) {
      // We'll fetch the updated activity data locally instead of triggering a full page refresh
      onParticipantsChanged(selectedActivity.id);
    }
  };

  const handleDeleteActivity = () => {
    if (selectedActivity) {
      setDeleteConfirm(selectedActivity);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm && onDeleteActivity) {
      await onDeleteActivity(deleteConfirm.id);
      setDeleteConfirm(null);
      setSelectedActivity(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const getActivityTypeText = (type) => {
    switch(type) {
      case "with_adherents":
        return "Avec adhérents";
      case "without_adherents":
        return "Sans adhérents";
      case "br":
        return "Bureau Restreint";
      default:
        return type;
    }
  };

  const renderActivityDetails = () => {
    if (!selectedActivity) return null;

    const startDate = parseISO(selectedActivity.start_date);
    const endDate = parseISO(selectedActivity.end_date);

    return (
      <div className={styles.activityDetails}>
        <div className={styles.detailsHeader}>
          <h3 className={styles.activityTitle}>{selectedActivity.title}</h3>

          <div className={styles.actionsButtonsContainer}>
            {selectedActivity.type === "with_adherents" && (
              <button
                className={styles.participantsButton}
                onClick={handleManageParticipants}
              >
                <FiUsers size={16} />
                <span>Participants</span>
              </button>
            )}
            <button
              className={styles.accompagnateursButton}
              onClick={handleManageAccompagnateurs}
            >
              <FiUserCheck size={16} />
              <span>Accompagnateurs</span>
            </button>
            <button
              className={styles.editButton}
              onClick={() => onEditActivity(selectedActivity)}
            >
              <FiEdit size={16} />
              <span>Modifier</span>
            </button>
            <button
              className={styles.deleteButton}
              onClick={handleDeleteActivity}
            >
              <FiTrash2 size={16} />
              <span>Supprimer</span>
            </button>
          </div>
        </div>

        <div className={styles.detailsContent}>
          <div className={styles.detailItem}>
            <FiClock className={styles.detailIcon} />
            <div>
              <div>
                <strong>Début:</strong>{" "}
                {format(startDate, "dd MMMM yyyy à HH:mm", { locale: fr })}
              </div>
              <div>
                <strong>Fin:</strong>{" "}
                {format(endDate, "dd MMMM yyyy à HH:mm", { locale: fr })}
              </div>
            </div>
          </div>

          <div className={styles.detailItem}>
            <FiMapPin className={styles.detailIcon} />
            <div>{selectedActivity.location || "Aucun lieu spécifié"}</div>
          </div>

          <div className={styles.detailItem}>
            <FiBriefcase className={styles.detailIcon} />
            <div>
              <strong>Type:</strong> {getActivityTypeText(selectedActivity.type)}
              {selectedActivity.type === "with_adherents" && (
                <div>
                  <strong>Participants:</strong>{" "}
                  {selectedActivity.participant_count || 0}
                  {selectedActivity.max_participants &&
                    ` / ${selectedActivity.max_participants}`}
                </div>
              )}
              {selectedActivity.transport_available && (
                <div>
                  <strong>Transport disponible:</strong>{" "}
                  {selectedActivity.transport_capacity} places
                </div>
              )}
            </div>
          </div>

          {selectedActivity.is_paid && (
            <div className={styles.detailItem}>
              <MdOutlineEuroSymbol className={styles.detailIcon} />
              <div>
                <strong>Activité payante:</strong>{" "}
                {selectedActivity.price ? `${selectedActivity.price} €` : "-"}
              </div>
            </div>
          )}

          {selectedActivity.description && (
            <div className={styles.description}>
              <h4>Description</h4>
              <p>{selectedActivity.description}</p>
            </div>
          )}
        </div>

        <button
          className={styles.closeButton}
          onClick={() => setSelectedActivity(null)}
        >
          Fermer
        </button>
      </div>
    );
  };

  const renderCalendar = () => {
    const days = getDaysInMonth();
    const firstDayOfMonth = getFirstDayOfMonth();
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

    return (
      <div className={styles.calendarGrid}>
        {dayNames.map((day, index) => (
          <div key={day} className={styles.dayName}>
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className={styles.emptyDay}></div>
        ))}

        {days.map((day) => {
          const dayActivities = getActivitiesForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toString()}
              className={`${styles.day} ${isCurrentDay ? styles.today : ""}`}
            >
              <div className={styles.dayNumber}>{format(day, "d")}</div>

              <div className={styles.activitiesList}>
                {dayActivities
                  .slice(0, 3)
                  .map((activity) => renderActivity(activity))}

                {dayActivities.length > 3 && (
                  <div className={styles.moreActivities}>
                    +{dayActivities.length - 3} plus
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <div className={styles.currentMonth}>
          {format(currentDate, "MMMM yyyy", { locale: fr })}
        </div>

        <div className={styles.navigationButtons}>
          <button className={styles.todayButton} onClick={goToToday}>
            Aujourd'hui
          </button>

          <button className={styles.navButton} onClick={previousMonth}>
            <FiChevronLeft size={20} />
          </button>

          <button className={styles.navButton} onClick={nextMonth}>
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span
            className={`${styles.legendColor} ${styles.withAdherentsColor}`}
          ></span>
          <span>Avec adhérents</span>
        </div>
        <div className={styles.legendItem}>
          <span
            className={`${styles.legendColor} ${styles.withoutAdherentsColor}`}
          ></span>
          <span>Sans adhérents</span>
        </div>
        <div className={styles.legendItem}>
          <span
            className={`${styles.legendColor} ${styles.brColor}`}
          ></span>
          <span>Bureau Restreint</span>
        </div>
      </div>

      <div className={styles.calendarWrapper}>
        {renderCalendar()}

        {selectedActivity && renderActivityDetails()}

        {showParticipants && selectedActivity && (
          <div className={styles.participantsOverlay}>
            <div className={styles.participantsContainer}>
              <ActivityParticipants
                activity={selectedActivity}
                onClose={() => setShowParticipants(false)}
                onUpdate={handleParticipantsChanged}
              />
            </div>
          </div>
        )}

        {showAccompagnateurs && selectedActivity && (
          <div className={styles.participantsOverlay}>
            <div className={styles.participantsContainer}>
              <ActivityAccompagnateurs
                activity={selectedActivity}
                onClose={() => setShowAccompagnateurs(false)}
                onUpdate={handleParticipantsChanged}
              />
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className={styles.deleteOverlay}>
            <div className={styles.deleteDialog}>
              <h3>Confirmer la suppression</h3>
              <p>
                Êtes-vous sûr de vouloir supprimer l'activité "{deleteConfirm.title}" ?
              </p>
              <p className={styles.deleteWarning}>
                Cette action est irréversible et supprimera également tous les participants
                et accompagnateurs associés à cette activité.
              </p>
              <div className={styles.deleteActions}>
                <button className={styles.cancelButton} onClick={cancelDelete}>
                  Annuler
                </button>
                <button className={styles.confirmButton} onClick={confirmDelete}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCalendar;