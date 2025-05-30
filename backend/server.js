require("dotenv").config();
const app = require("./src/app");
const logger = require("./src/utils/logger");
const { runMigrations } = require("./src/utils/dbMigrate");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await runMigrations();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
      logger.info(`Server ready to accept connections`);
    });
  } catch (error) {
    logger.error("Server startup error:", error);
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (err) => {
  logger.error("🚨 Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("🚨 Uncaught Exception:", err);
  process.exit(1);
});