import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Login.module.css";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Connexion réussie");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <img
            src="/logo.svg"
            alt="Association Phénix"
            className={styles.logo}
          />
          <h1 className={styles.title}>Association Phénix</h1>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Connexion</h2>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className={styles.footerText}>
          <p>Association Phénix &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
