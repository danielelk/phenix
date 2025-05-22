import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdherentRegistrationPage.module.css";
import AdherentRegistrationForm from "../../components/adherent/AdherentRegistrationForm";
import RegistrationConfirmation from "./RegistrationConfirmation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdherentRegistrationPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const navigate = useNavigate();

  const handleFormSubmit = (result) => {
    setSubmittedData(result.data?.membershipRequest);
    setIsSubmitted(true);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (isSubmitted) {
    return <RegistrationConfirmation requestData={submittedData} />;
  }

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

      <AdherentRegistrationForm onSubmit={handleFormSubmit} />

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