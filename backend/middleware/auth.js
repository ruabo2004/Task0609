const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Customer = require('../models/Customer');

const generateToken = (customer) => {
  return jwt.sign(
    { 
      customer_id: customer.customer_id, 
      email: customer.email,
      role: 'customer'
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const customer = await Customer.findById(decoded.customer_id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - customer not found'
      });
    }

    req.customer = customer;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const customer = await Customer.findById(decoded.customer_id);
      if (customer) {
        req.customer = customer;
      }
    }
    
    next();
  } catch (error) {
    
    next();
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  optionalAuth
};
