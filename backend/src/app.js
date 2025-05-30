require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
const recurringActivityRoutes = require("./routes/recurringActivityRoutes");
const formuleRoutes = require("./routes/formuleRoutes");
const membershipRequestRoutes = require("./routes/membershipRequestRoutes");
const logger = require("./utils/logger");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  logger.info(`[${timestamp}] ${req.method} ${req.path} - Body:`, req.body);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/recurring-activities", recurringActivityRoutes);
app.use("/api/formules", formuleRoutes);
app.use("/api/membership-requests", membershipRequestRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.all("*", (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;