require("dotenv").config();
const app = require("./src/app");
const logger = require("./src/utils/logger");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  process.exit(1);
});
