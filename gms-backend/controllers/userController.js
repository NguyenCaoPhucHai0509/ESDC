// controllers/userController.js
const User = require('../models/User');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin/Receptionist
exports.getUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    let query = {};
    
    // Apply role filtering if provided
    if (role) {
      query.role = role;
    }
    
    // If receptionist, restrict to only see customers and trainers
    if (req.user.role === 'receptionist') {
      query.role = query.role || { $in: ['customer', 'trainer'] };
    }
    
    const users = await User.find(query)
      .select('-password')
      .populate('trainer', 'fullName email avatar');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
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

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin/Receptionist
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('trainer', 'fullName email avatar')
      .populate('membershipInfo.type');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if receptionist trying to access admin/receptionist user
    if (req.user.role === 'receptionist' && 
        (user.role === 'admin' || user.role === 'receptionist')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this information'
      });
    }

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

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin/Receptionist
exports.createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, address, role } = req.body;

    // Check permissions for role creation
    if (req.user.role === 'receptionist' && (role === 'admin' || role === 'receptionist')) {
      return res.status(403).json({
        success: false,
        message: 'Receptionist can only create customer and trainer accounts'
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Create the user
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      address,
      role: role || 'customer'
    });

    res.status(201).json({
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

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin/Receptionist
exports.updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, address, role } = req.body;
    
    // Get user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions - receptionist can't update admin/receptionist
    if (req.user.role === 'receptionist' && 
        (user.role === 'admin' || user.role === 'receptionist')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this information'
      });
    }

    // Check permissions - receptionist can't change role to admin/receptionist
    if (req.user.role === 'receptionist' && 
        (role === 'admin' || role === 'receptionist')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update to this role'
      });
    }

    // If email is changing, check if it exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update user
    const updateData = {
      fullName: fullName || user.fullName,
      email: email || user.email,
      phoneNumber: phoneNumber || user.phoneNumber,
      address: address || user.address
    };

    // Only admin can change roles
    if (req.user.role === 'admin' && role) {
      updateData.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
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

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin/Receptionist
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions - receptionist can't delete admin/receptionist
    if (req.user.role === 'receptionist' && 
        (user.role === 'admin' || user.role === 'receptionist')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this account'
      });
    }

    // Delete avatar if exists
    if (user.avatar && user.avatar !== 'default-avatar.png') {
      const avatarPath = path.join(__dirname, '../uploads', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await user.deleteOne();

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

// @desc    Upload user avatar
// @route   PUT /api/users/:id/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    const uploadSingle = upload.single('avatar');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a file'
        });
      }
      
      // Check if user is updating their own avatar or admin is updating
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to change another user\'s avatar'
        });
      }
      
      // Get user to check if they have an existing avatar
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Delete old avatar if it exists and is not the default
      if (user.avatar && user.avatar !== 'default-avatar.png') {
        const oldAvatarPath = path.join(__dirname, '../uploads', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      // Update user avatar
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { avatar: req.file.filename },
        { new: true }
      );
      
      res.status(200).json({
        success: true,
        data: {
          avatar: updatedUser.avatar
        }
      });
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

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
exports.resetPassword = async (req, res, next) => {
  try {
    // Only admin can reset passwords
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this function'
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Set new password
    const newPassword = req.body.password || '123456';
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
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