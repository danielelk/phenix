import React from "react";
import styles from "./AdherentRegistrationPage.module.css";
import AdherentRegistrationForm from "../../components/adherent/AdherentRegistrationForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdherentRegistrationPage = () => {
  return (
    <div className={styles.registrationPage}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <AdherentRegistrationForm />

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.copyright}>
            Association Phénix &copy; {new Date().getFullYear()} - Tous droits réservés
          </p>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>Politique de confidentialité</a>
            <a href="#" className={styles.footerLink}>Mentions légales</a>
            <a href="#" className={styles.footerLink}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdherentRegistrationPage;