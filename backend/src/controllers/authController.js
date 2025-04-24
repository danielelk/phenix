const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const logger = require("../utils/logger");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already in use",
      });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
    });

    const token = signToken(newUser.id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          id: newUser.id,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    logger.error("Register error:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating user",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      console.log("User not found for email:", email); // Log if the user is not found
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    console.log("User found:", user); // Log the user details
    const isPasswordCorrect = await User.correctPassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const token = signToken(user.id);

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Error logging in",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    logger.error("GetMe error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting user",
    });
  }
};
