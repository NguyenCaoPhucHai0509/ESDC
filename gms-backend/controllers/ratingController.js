const Rating = require('../models/Rating');
const User = require('../models/User');

// @desc    Create a new rating
// @route   POST /api/ratings
// @access  Private
exports.createRating = async (req, res, next) => {
  try {
    const { to, rating, comment } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải có điểm từ 1-5'
      });
    }
    
    // Check if target user exists and is a trainer
    const trainer = await User.findOne({
      _id: to,
      role: 'trainer'
    });
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy huấn luyện viên'
      });
    }
    
    // Ensure user is not rating themselves
    if (req.user.id === to) {
      return res.status(400).json({
        success: false,
        message: 'Không thể tự đánh giá chính mình'
      });
    }
    
    // Check if user has already rated this trainer
    const existingRating = await Rating.findOne({
      from: req.user.id,
      to
    });
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment;
      await existingRating.save();
      
      const updatedRating = await Rating.findById(existingRating._id)
        .populate('from', 'fullName avatar')
        .populate('to', 'fullName avatar');
      
      return res.status(200).json({
        success: true,
        message: 'Cập nhật đánh giá thành công',
        data: updatedRating
      });
    }
    
    // Create new rating
    const newRating = await Rating.create({
      from: req.user.id,
      to,
      rating,
      comment
    });
    
    const fullRating = await Rating.findById(newRating._id)
      .populate('from', 'fullName avatar')
      .populate('to', 'fullName avatar');
    
    res.status(201).json({
      success: true,
      data: fullRating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get all ratings
// @route   GET /api/ratings
// @access  Private/Admin
exports.getRatings = async (req, res, next) => {
  try {
    // Only admin can access all ratings
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }
    
    const ratings = await Rating.find()
      .populate('from', 'fullName avatar')
      .populate('to', 'fullName avatar')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get ratings for a user
// @route   GET /api/ratings/user/:userId
// @access  Private
exports.getUserRatings = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists and is a trainer
    const user = await User.findOne({
      _id: userId,
      role: 'trainer'
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy huấn luyện viên'
      });
    }
    
    // Get all ratings for this user
    const ratings = await Rating.find({ to: userId })
      .populate('from', 'fullName avatar')
      .sort('-createdAt');
    
    // Calculate average rating
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        ratings,
        count: ratings.length,
        averageRating
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Update rating
// @route   PUT /api/ratings/:id
// @access  Private
exports.updateRating = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải có điểm từ 1-5'
      });
    }
    
    const ratingDoc = await Rating.findById(req.params.id);
    
    if (!ratingDoc) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }
    
    // Check if the user is the owner of the rating
    if (ratingDoc.from.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật đánh giá này'
      });
    }
    
    // Update rating
    ratingDoc.rating = rating;
    ratingDoc.comment = comment;
    await ratingDoc.save();
    
    const updatedRating = await Rating.findById(ratingDoc._id)
      .populate('from', 'fullName avatar')
      .populate('to', 'fullName avatar');
    
    res.status(200).json({
      success: true,
      data: updatedRating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Delete rating
// @route   DELETE /api/ratings/:id
// @access  Private
exports.deleteRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }
    
    // Check if the user is the owner of the rating or admin
    if (rating.from.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa đánh giá này'
      });
    }
    
    await rating.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};