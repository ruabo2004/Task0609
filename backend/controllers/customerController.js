const Customer = require("../models/Customer");
const { generateToken } = require("../middleware/authEnhanced");
const { validationResult } = require("express-validator");

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { full_name, email, password, phone, address, date_of_birth } =
      req.body;

    const existingCustomer = await Customer.findByEmail(email);
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const customer = await Customer.create({
      full_name,
      email,
      password,
      phone,
      address,
      date_of_birth,
    });

    const token = generateToken(customer);

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: {
        customer: customer.toJSON(),
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const customer = await Customer.findByEmail(email);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await Customer.verifyPassword(
      password,
      customer.password_hash
    );
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(customer);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        customer: customer.toJSON(),
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        customer: req.customer.toJSON(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { full_name, phone, address, date_of_birth } = req.body;

    const updatedCustomer = await req.customer.update({
      full_name,
      phone,
      address,
      date_of_birth,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        customer: updatedCustomer.toJSON(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    await req.customer.changePassword(currentPassword, newPassword);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error.message.includes("Current password is incorrect")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

const getBookingHistory = async (req, res) => {
  try {
    const bookings = await req.customer.getBookingHistory();

    res.json({
      success: true,
      message: "Booking history retrieved successfully",
      data: {
        bookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get booking history",
      error: error.message,
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await req.customer.getReviews();

    res.json({
      success: true,
      message: "Reviews retrieved successfully",
      data: {
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
      error: error.message,
    });
  }
};

const deactivateAccount = async (req, res) => {
  try {
    await req.customer.deactivate();

    res.json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to deactivate account",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getBookingHistory,
  getReviews,
  deactivateAccount,
};
