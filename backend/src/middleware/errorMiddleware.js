const logger = require("../utils/logger");

exports.errorHandler = (err, req, res, next) => {
  logger.error("Error:", err);

  const error = {
    statusCode: err.statusCode || 500,
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  if (err.code === "23505") {
    error.statusCode = 400;
    error.message = "Duplicate field value entered";
  }

  if (err.name === "JsonWebTokenError") {
    error.statusCode = 401;
    error.message = "Invalid token. Please log in again";
  }

  if (err.name === "TokenExpiredError") {
    error.statusCode = 401;
    error.message = "Your token has expired. Please log in again";
  }

  res.status(error.statusCode).json({
    status: error.statusCode >= 500 ? "error" : "fail",
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
