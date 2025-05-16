import React from "react";
import styles from "./MembershipRequestsPage.module.css";
import MembershipRequestsList from "../../components/membership/MembershipRequestsList";

const MembershipRequestsPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2>Demandes d'adhésion</h2>
        <p className={styles.pageDescription}>
          Gérez les demandes d'adhésion à l'association. Vous pouvez approuver, rejeter ou consulter les détails des demandes.
        </p>
      </div>

      <MembershipRequestsList />
    </div>
  );
};

export default MembershipRequestsPage;