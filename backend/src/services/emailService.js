const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

/**
 * Email service - Handle email sending functionality
 */
class EmailService {
  constructor() {
    // Create nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify connection configuration if in development mode
    if (process.env.NODE_ENV === "development") {
      this.verifyConnection();
    }
  }

  /**
   * Verify email connection configuration
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info("Email service connection verified");
    } catch (error) {
      logger.error("Email service connection failed:", error);
    }
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} Nodemailer send response
   */
  async sendEmail(options) {
    try {
      const emailDefaults = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      };

      const emailOptions = {
        ...emailDefaults,
        ...options,
      };

      const info = await this.transporter.sendMail(emailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error("Error sending email:", error);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   * @param {Object} user - User object
   * @returns {Promise<Object>} Email send result
   */
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: "Bienvenue à l'Association Phénix",
      html: `
        <div>
          <h1>Bienvenue ${user.first_name} ${user.last_name}!</h1>
          <p>Merci de rejoindre l'Association Phénix.</p>
          <p>Vous pouvez maintenant vous connecter à notre application avec votre email et mot de passe.</p>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <p>Cordialement,</p>
          <p>L'équipe de l'Association Phénix</p>
        </div>
      `,
    });
  }

  /**
   * Send activity registration confirmation
   * @param {Object} user - User object
   * @param {Object} activity - Activity object
   * @returns {Promise<Object>} Email send result
   */
  async sendActivityRegistrationEmail(user, activity) {
    return this.sendEmail({
      to: user.email,
      subject: `Confirmation d'inscription à l'activité: ${activity.title}`,
      html: `
        <div>
          <h1>Confirmation d'inscription</h1>
          <p>Bonjour ${user.first_name} ${user.last_name},</p>
          <p>Votre inscription à l'activité "${
            activity.title
          }" a été confirmée.</p>
          <p><strong>Date:</strong> ${new Date(
            activity.start_date
          ).toLocaleDateString("fr-FR")} à ${new Date(
        activity.start_date
      ).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
          <p><strong>Lieu:</strong> ${activity.location}</p>
          ${
            activity.description
              ? `<p><strong>Description:</strong> ${activity.description}</p>`
              : ""
          }
          <p>Nous vous attendons!</p>
          <p>Cordialement,</p>
          <p>L'équipe de l'Association Phénix</p>
        </div>
      `,
    });
  }

  /**
   * Send activity reminder email
   * @param {Object} user - User object
   * @param {Object} activity - Activity object
   * @returns {Promise<Object>} Email send result
   */
  async sendActivityReminderEmail(user, activity) {
    return this.sendEmail({
      to: user.email,
      subject: `Rappel: ${activity.title}`,
      html: `
        <div>
          <h1>Rappel d'activité</h1>
          <p>Bonjour ${user.first_name} ${user.last_name},</p>
          <p>Nous vous rappelons que l'activité "${
            activity.title
          }" aura lieu demain.</p>
          <p><strong>Date:</strong> ${new Date(
            activity.start_date
          ).toLocaleDateString("fr-FR")} à ${new Date(
        activity.start_date
      ).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
          <p><strong>Lieu:</strong> ${activity.location}</p>
          ${
            activity.description
              ? `<p><strong>Description:</strong> ${activity.description}</p>`
              : ""
          }
          <p>Nous vous attendons!</p>
          <p>Cordialement,</p>
          <p>L'équipe de l'Association Phénix</p>
        </div>
      `,
    });
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   * @returns {Promise<Object>} Email send result
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    return this.sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div>
          <h1>Réinitialisation de mot de passe</h1>
          <p>Bonjour ${user.first_name} ${user.last_name},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <p>Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe:</p>
          <p><a href="${resetURL}" target="_blank">Réinitialiser mon mot de passe</a></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
          <p>Cordialement,</p>
          <p>L'équipe de l'Association Phénix</p>
        </div>
      `,
    });
  }
}

module.exports = new EmailService();
