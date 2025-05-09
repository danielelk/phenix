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
} from "react-icons/fi";
import { MdOutlineEuroSymbol } from "react-icons/md";
import ActivityParticipants from "./ActivityParticipants";

const ActivityCalendar = ({
  activities,
  onEditActivity,
  currentDate,
  onMonthChange,
  onParticipantsChanged,
}) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);

  // Navigate to previous month
  const previousMonth = () => {
    onMonthChange(subMonths(currentDate, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    onMonthChange(addMonths(currentDate, 1));
  };

  // Navigate to today
  const goToToday = () => {
    onMonthChange(new Date());
  };

  // Get days in the current month
  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  // Get the day of the week for the first day of the month (0 for Sunday, 6 for Saturday)
  const getFirstDayOfMonth = () => {
    return startOfMonth(currentDate).getDay();
  };

  // Get activities for a specific day
  const getActivitiesForDay = (day) => {
    return activities.filter((activity) =>
      isSameDay(parseISO(activity.start_date), day)
    );
  };

  // Render activity item
  const renderActivity = (activity) => {
    // Determine the activity type class
    const typeClass =
      activity.type === "with_adherents"
        ? styles.withAdherentsActivity
        : styles.withoutAdherentsActivity;

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

  // Handle participants management
  const handleManageParticipants = () => {
    if (selectedActivity && selectedActivity.type === "with_adherents") {
      setShowParticipants(true);
    }
  };

  // Handle participants changed
  const handleParticipantsChanged = () => {
    if (onParticipantsChanged) {
      onParticipantsChanged();
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
              className={styles.editButton}
              onClick={() => onEditActivity(selectedActivity)}
            >
              <FiEdit size={16} />
              <span>Modifier</span>
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
            <FiUsers className={styles.detailIcon} />
            <div>
              <strong>Type:</strong>{" "}
              {selectedActivity.type === "with_adherents"
                ? "Avec adhérents"
                : "Sans adhérents"}
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

  // Render calendar grid
  const renderCalendar = () => {
    const days = getDaysInMonth();
    const firstDayOfMonth = getFirstDayOfMonth();

    // Array of day names
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

    return (
      <div className={styles.calendarGrid}>
        {/* Day names row */}
        {dayNames.map((day, index) => (
          <div key={day} className={styles.dayName}>
            {day}
          </div>
        ))}

        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className={styles.emptyDay}></div>
        ))}

        {/* Calendar days */}
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
      </div>
    </div>
  );
};

export default ActivityCalendar;
