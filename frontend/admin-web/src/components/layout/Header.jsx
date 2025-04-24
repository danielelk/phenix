import React from "react";
import { useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { FiMenu, FiX, FiBell, FiUser } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/dashboard") return "Tableau de bord";
    if (path.startsWith("/users")) return "Gestion des utilisateurs";
    if (path.startsWith("/activities")) return "Gestion des activités";
    if (path.startsWith("/planning")) return "Planning";
    if (path.startsWith("/settings")) return "Paramètres";

    return "Association Phénix";
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          onClick={toggleSidebar}
          className={styles.menuButton}
          aria-label="Toggle sidebar"
        >
          <FiMenu size={24} />
        </button>

        <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <FiUser size={18} />
          </div>
          <span className={styles.userName}>
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
