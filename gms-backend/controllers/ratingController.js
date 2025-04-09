// @desc    Lấy đánh giá cho một huấn luyện viên
// @route   GET /api/ratings/trainer/:trainerId
// @access  Public
exports.getTrainerRatings = async (req, res, next) => {
  try {
    const trainerId = req.params.trainerId;
    
    // Kiểm tra huấn luyện viên tồn tại
    const trainer = await User.findOne({ _id: trainerId, role: 'trainer' });
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy huấn luyện viên'
      });
    }
    
    // Lấy tất cả đánh giá cho huấn luyện viên
    const ratings = await Rating.find({ to: trainerId })
      .populate('from', 'fullName avatar')
      .sort('-createdAt');
    
    // Tính điểm trung bình
    let averageRating = 0;
    if (ratings.length > 0) {
      averageRating = ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;
    }
    
    res.status(200).json({
      success: true,
      data: {
        ratings,
        count: ratings.length,
        averageRating
      }
    });
  } catch (error) {
    next(error);
  }
};