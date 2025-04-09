const User = require('../models/User');
const upload = require('../middleware/upload');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    const users = await User.find(query);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    await user.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
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
          message: 'Vui lòng upload file'
        });
      }
      
      // Check if user is updating their own avatar or admin is updating
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Không được phép thay đổi avatar của người khác'
        });
      }
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { avatar: req.file.filename },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          avatar: user.avatar
        }
      });
    });
  } catch (err) {
    next(err);
  }
};