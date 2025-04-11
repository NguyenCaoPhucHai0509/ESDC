const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      address: user.address,
      trainer: user.trainer,
      specialization: user.specialization,
      experience: user.experience,
      bio: user.bio
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (for customers) / Private (for admin/receptionist creating other roles)
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, address, role } = req.body;

    // Check permission for creating account
    if (req.user) {
      // If not admin and wants to create an admin account
      if (req.user.role !== 'admin' && role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admin can create other admin accounts'
        });
      }
      
      // If receptionist and wants to create an account other than customer or trainer
      if (req.user.role === 'receptionist' && (role === 'admin' || role === 'receptionist')) {
        return res.status(403).json({
          success: false,
          message: 'Receptionist can only create customer and trainer accounts'
        });
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Create account
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      address,
      role: role || 'customer'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('trainer', 'fullName email avatar phoneNumber specialization experience bio')
      .populate('membershipInfo.type');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address
    };

    // If user is trainer, update trainer specific fields
    if (req.user.role === 'trainer') {
      if (req.body.specialization) fieldsToUpdate.specialization = req.body.specialization;
      if (req.body.experience) fieldsToUpdate.experience = req.body.experience;
      if (req.body.bio) fieldsToUpdate.bio = req.body.bio;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Upload avatar
// @route   PUT /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an avatar image'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.filename },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
};