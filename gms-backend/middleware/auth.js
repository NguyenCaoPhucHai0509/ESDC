const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify token and add user to request
exports.protect = async (req, res, next) => {
  let token;

  // Check if auth header exists and has token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, please login'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    req.user = await User.findById(decoded.id).select('-password');
    
    // If user not found
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User does not exist'
      });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    
    // Handle different jwt errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      });
    }
    
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to perform this action`
      });
    }
    
    next();
  };
};