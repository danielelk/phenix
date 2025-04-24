const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const db = require("../config/db");
const logger = require("../utils/logger");

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please log in to get access.",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const { rows } = await db.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    const currentUser = rows[0];
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return res.status(401).json({
      status: "fail",
      message: "Not authorized to access this route",
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
