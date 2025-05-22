import React from "react";
import styles from "./RegistrationConfirmation.module.css";
import { FiCheckCircle } from "react-icons/fi";

const RegistrationConfirmation = ({ requestData }) => {
  return (
    <div className={styles.confirmationPage}>
      <div className={styles.confirmationCard}>
        <div className={styles.successIcon}>
          <FiCheckCircle size={80} />
        </div>

        <h1 className={styles.title}>Demande envoyée avec succès !</h1>
        
        <p className={styles.subtitle}>
          Votre demande d'adhésion à l'Association Phénix a été transmise. 
          Notre équipe l'examinera dans les plus brefs délais.
        </p>

        <div className={styles.thankYouMessage}>
          <p>Merci pour votre intérêt pour notre association.</p>
          <p>Vous pouvez maintenant fermer cette page.</p>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.copyright}>
            Association Phénix &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RegistrationConfirmation;