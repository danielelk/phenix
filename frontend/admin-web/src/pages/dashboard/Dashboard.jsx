import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { FiCalendar, FiUsers, FiClock } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import activityService from "../../services/activities";
import userService from "../../services/users";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [userStats, setUserStats] = useState({
    admins: 0,
    accompagnateurs: 0,
    adherents: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get upcoming activities for the next 7 days
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const startDate = today.toISOString().split("T")[0];
        const endDate = nextWeek.toISOString().split("T")[0];

        const activitiesResponse =
          await activityService.getActivitiesByDateRange(startDate, endDate);
        setUpcomingActivities(activitiesResponse.data.activities || []);

        // Get user stats
        const usersResponse = await userService.getUsers({ limit: 1 });
        console.log("User stats response:", usersResponse); // Debug

        if (usersResponse.data && usersResponse.data.stats) {
          setUserStats(usersResponse.data.stats);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.welcomeText}>Bonjour, {user?.firstName} 👋</h2>

      <div className={styles.dashboardGrid}>
        {user?.role === "admin" && (
          <div className={styles.statsSection}>
            <h3 className={styles.sectionTitle}>Statistiques</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiUsers size={24} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>
                    {userStats.adherents || 0}
                  </div>
                  <div className={styles.statLabel}>Adhérents</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiUsers size={24} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>
                    {userStats.accompagnateurs || 0}
                  </div>
                  <div className={styles.statLabel}>Accompagnateurs</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiCalendar size={24} />
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>
                    {upcomingActivities.length}
                  </div>
                  <div className={styles.statLabel}>Activités à venir</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.activitiesSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Activités à venir</h3>
            <Link to="/activities" className={styles.viewAllLink}>
              Voir toutes les activités
            </Link>
          </div>

          {loading ? (
            <div className={styles.loading}>Chargement des activités...</div>
          ) : upcomingActivities.length === 0 ? (
            <div className={styles.emptyState}>
              <FiCalendar size={48} className={styles.emptyIcon} />
              <p>Aucune activité prévue pour les 7 prochains jours</p>
            </div>
          ) : (
            <div className={styles.activitiesList}>
              {upcomingActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className={styles.activityCard}>
                  <div className={styles.activityDate}>
                    <FiClock size={18} />
                    <span>
                      {format(parseISO(activity.start_date), "EEEE d MMMM", {
                        locale: fr,
                      })}
                    </span>
                    <span className={styles.activityTime}>
                      {format(parseISO(activity.start_date), "HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </div>

                  <div className={styles.activityInfo}>
                    <h4 className={styles.activityTitle}>{activity.title}</h4>
                    <p className={styles.activityLocation}>
                      {activity.location}
                    </p>

                    {activity.type === "with_adherents" && (
                      <div className={styles.participantsInfo}>
                        <FiUsers size={16} />
                        <span>
                          {activity.participant_count || 0}
                          {activity.max_participants
                            ? ` / ${activity.max_participants}`
                            : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
