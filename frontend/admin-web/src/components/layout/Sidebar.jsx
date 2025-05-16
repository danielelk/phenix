import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAuth } from "../../hooks/useAuth";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiClipboard,
  FiSettings,
  FiLogOut,
  FiUserPlus
} from "react-icons/fi";

const Sidebar = ({ collapsed }) => {
  const { user, logout, isAdmin } = useAuth();

  // Define navigation items based on user role
  const navItems = [
    {
      title: "Tableau de bord",
      path: "/dashboard",
      icon: <FiHome size={20} />,
      roles: ["admin", "accompagnateur"],
    },
    {
      title: "Utilisateurs",
      path: "/users",
      icon: <FiUsers size={20} />,
      roles: ["admin"],
    },
    {
      title: "Activités",
      path: "/activities",
      icon: <FiCalendar size={20} />,
      roles: ["admin", "accompagnateur"],
    },
    {
      title: "Planning",
      path: "/planning",
      icon: <FiClipboard size={20} />,
      roles: ["admin", "accompagnateur"],
    },
    {
      title: "Demandes d'adhésion",
      path: "/membership-requests",
      icon: <FiUserPlus size={20} />,
      roles: ["admin"],
    },
    {
      title: "Paramètres",
      path: "/settings",
      icon: <FiSettings size={20} />,
      roles: ["admin"],
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.logoContainer}>
        <img src="/logo.svg" alt="Association Phénix" className={styles.logo} />
        {!collapsed && <h2 className={styles.logoText}>Association Phénix</h2>}
      </div>

      <nav className={styles.navMenu}>
        <ul className={styles.navList}>
          {filteredNavItems.map((item) => (
            <li key={item.path} className={styles.navItem}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
                title={collapsed ? item.title : undefined}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!collapsed && (
                  <span className={styles.navText}>{item.title}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.userInfo}>
        {!collapsed && (
          <div className={styles.userDetails}>
            <p className={styles.userName}>
              {user?.firstName} {user?.lastName}
            </p>
            <p className={styles.userRole}>
              {user?.role === "admin" ? "Administrateur" : "Accompagnateur"}
            </p>
          </div>
        )}
      </div>

      <button
        className={styles.logoutButton}
        onClick={logout}
        title={collapsed ? "Déconnexion" : undefined}
      >
        <span className={styles.navIcon}>
          <FiLogOut size={20} />
        </span>
        {!collapsed && <span className={styles.navText}>Déconnexion</span>}
      </button>
    </aside>
  );
};

export default Sidebar;