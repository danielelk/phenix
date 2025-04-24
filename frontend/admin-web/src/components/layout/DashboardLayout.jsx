import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import styles from "./DashboardLayout.module.css";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar collapsed={sidebarCollapsed} />

      <div
        className={`${styles.mainContent} ${
          sidebarCollapsed ? styles.expanded : ""
        }`}
      >
        <Header toggleSidebar={toggleSidebar} />

        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
