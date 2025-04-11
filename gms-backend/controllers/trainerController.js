const User = require('../models/User');
const TrainerRequest = require('../models/TrainerRequest');
const Conversation = require('../models/Conversation');
const Rating = require('../models/Rating');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private
exports.getTrainers = async (req, res, next) => {
  try {
    // Find all trainers
    const trainers = await User.find({ role: 'trainer' })
      .select('-password')
      .select('-__v');

    // Get ratings for each trainer
    const trainerIds = trainers.map(trainer => trainer._id);
    const ratings = await Rating.find({ to: { $in: trainerIds } });

    // Calculate average rating for each trainer
    const trainersWithRatings = trainers.map(trainer => {
      const trainerRatings = ratings.filter(
        rating => rating.to.toString() === trainer._id.toString()
      );
      
      const averageRating = trainerRatings.length > 0
        ? trainerRatings.reduce((sum, item) => sum + item.rating, 0) / trainerRatings.length
        : 0;
      
      // Convert to plain object to add new properties
      const trainerObj = trainer.toObject();
      trainerObj.averageRating = averageRating;
      trainerObj.ratingCount = trainerRatings.length;
      
      return trainerObj;
    });

    res.status(200).json({
      success: true,
      count: trainersWithRatings.length,
      data: trainersWithRatings
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

// @desc    Get single trainer
// @route   GET /api/trainers/:id
// @access  Private
exports.getTrainer = async (req, res, next) => {
  try {
    const trainer = await User.findOne({
      _id: req.params.id,
      role: 'trainer'
    }).select('-password');

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy huấn luyện viên'
      });
    }

    // Get trainer ratings
    const ratings = await Rating.find({ to: trainer._id })
      .populate('from', 'fullName avatar')
      .sort('-createdAt');

    // Calculate average rating
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
      : 0;

    // Get trainer's customers
    const customers = await User.find({ 
      trainer: trainer._id,
      role: 'customer'
    }).select('fullName email avatar phoneNumber');

    // Convert to plain object to add new properties
    const trainerData = trainer.toObject();
    trainerData.averageRating = averageRating;
    trainerData.ratings = ratings;
    trainerData.customers = customers;

    res.status(200).json({
      success: true,
      data: trainerData
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

// @desc    Update trainer profile
// @route   PUT /api/trainers/profile
// @access  Private/Trainer
exports.updateTrainerProfile = async (req, res, next) => {
  try {
    // Check if user is a trainer
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ huấn luyện viên mới có thể cập nhật thông tin này'
      });
    }

    // Chỉ cho phép cập nhật các trường chuyên môn
    const allowedUpdates = {
      specialization: req.body.specialization,
      experience: req.body.experience,
      bio: req.body.bio
    };

    // Loại bỏ các trường null/undefined
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const trainer = await User.findByIdAndUpdate(
      req.user.id,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: trainer
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

// @desc    Khách hàng gửi yêu cầu huấn luyện viên
// @route   POST /api/trainers/request/:trainerId
// @access  Private/Customer
exports.requestTrainer = async (req, res, next) => {
  try {
    // Validate user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ khách hàng mới có thể gửi yêu cầu huấn luyện'
      });
    }

    const { message } = req.body;
    
    // Check if trainer exists
    const trainer = await User.findOne({
      _id: req.params.trainerId,
      role: 'trainer'
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy huấn luyện viên'
      });
    }
    
    // Kiểm tra nếu đã có yêu cầu trước đó
    const existingRequest = await TrainerRequest.findOne({
      customer: req.user.id,
      trainer: req.params.trainerId,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã gửi yêu cầu cho huấn luyện viên này'
      });
    }
    
    // Kiểm tra nếu người dùng này đã có huấn luyện viên
    const user = await User.findById(req.user.id);
    if (user.trainer) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có huấn luyện viên, vui lòng hủy kết nối trước khi yêu cầu huấn luyện viên mới'
      });
    }
    
    // Tạo yêu cầu mới
    const trainerRequest = await TrainerRequest.create({
      customer: req.user.id,
      trainer: req.params.trainerId,
      message: message || 'Tôi muốn được huấn luyện'
    });
    
    // Populate thông tin cho response
    const populatedRequest = await TrainerRequest.findById(trainerRequest._id)
      .populate('customer', 'fullName email avatar')
      .populate('trainer', 'fullName email avatar');
    
    res.status(201).json({
      success: true,
      data: populatedRequest
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

// @desc    Huấn luyện viên xác nhận/từ chối yêu cầu kết nối
// @route   PUT /api/trainers/respond/:requestId
// @access  Private/Trainer
exports.respondToTrainerRequest = async (req, res, next) => {
  try {
    // Validate user is a trainer
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ huấn luyện viên mới có thể phản hồi yêu cầu'
      });
    }

    const { status } = req.body; // 'accepted' or 'rejected'
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }
    
    const request = await TrainerRequest.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu'
      });
    }
    
    // Kiểm tra nếu người dùng hiện tại là huấn luyện viên được yêu cầu
    if (request.trainer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền phản hồi yêu cầu này'
      });
    }
    
    // Cập nhật trạng thái yêu cầu
    request.status = status;
    await request.save();
    
    // Nếu chấp nhận, cập nhật trainer cho customer và tạo cuộc trò chuyện
    if (status === 'accepted') {
      await User.findByIdAndUpdate(request.customer, {
        trainer: req.user.id
      });
      
      // Tạo cuộc trò chuyện giữa HLV và khách hàng
      await Conversation.create({
        isGroupChat: false,
        participants: [req.user.id, request.customer]
      });
    }
    
    // Populate thông tin cho response
    const populatedRequest = await TrainerRequest.findById(request._id)
      .populate('customer', 'fullName email avatar')
      .populate('trainer', 'fullName email avatar');
    
    res.status(200).json({
      success: true,
      data: populatedRequest
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

// @desc    Lấy danh sách yêu cầu huấn luyện
// @route   GET /api/trainers/requests
// @access  Private/Trainer
exports.getTrainerRequests = async (req, res, next) => {
  try {
    // Nếu là huấn luyện viên, lấy các yêu cầu dành cho mình
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ huấn luyện viên mới có thể xem yêu cầu huấn luyện'
      });
    }
    
    const requests = await TrainerRequest.find({ trainer: req.user.id })
      .populate('customer', 'fullName email avatar phoneNumber')
      .populate('trainer', 'fullName email avatar')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
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

// @desc    Lấy danh sách khách hàng của huấn luyện viên
// @route   GET /api/trainers/customers
// @access  Private/Trainer
exports.getTrainerCustomers = async (req, res, next) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ huấn luyện viên mới có thể xem danh sách khách hàng'
      });
    }
    
    const customers = await User.find({ 
      trainer: req.user.id,
      role: 'customer'
    }).select('fullName email phoneNumber address avatar');
    
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
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

// @desc    Khách hàng hủy kết nối với huấn luyện viên
// @route   DELETE /api/trainers/disconnect
// @access  Private/Customer
exports.disconnectTrainer = async (req, res, next) => {
  try {
    // Validate user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ khách hàng mới có thể hủy kết nối huấn luyện viên'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user.trainer) {
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa có huấn luyện viên'
      });
    }
    
    // Lưu ID HLV trước khi xóa để thông báo
    const trainerId = user.trainer;
    
    // Cập nhật user, xoá trainer
    user.trainer = null;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã hủy kết nối với huấn luyện viên',
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

// @desc    Tạo đánh giá cho huấn luyện viên
// @route   POST /api/trainers/:id/rate
// @access  Private/Customer
exports.rateTrainer = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải có điểm từ 1-5'
      });
    }
    
    // Kiểm tra HLV tồn tại
    const trainer = await User.findOne({
      _id: req.params.id,
      role: 'trainer'
    });
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy huấn luyện viên'
      });
    }
    
    // Kiểm tra người đánh giá là khách hàng
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ khách hàng mới có thể đánh giá huấn luyện viên'
      });
    }
    
    // Kiểm tra xem đã từng là khách hàng của HLV này chưa
    // (Có thể cần thêm kiểm tra lịch sử kết nối nếu hệ thống lưu)
    
    // Kiểm tra xem đã đánh giá trước đó chưa
    let existingRating = await Rating.findOne({
      from: req.user.id,
      to: req.params.id
    });
    
    if (existingRating) {
      // Cập nhật đánh giá cũ
      existingRating.rating = rating;
      existingRating.comment = comment;
      await existingRating.save();
      
      const populatedRating = await Rating.findById(existingRating._id)
        .populate('from', 'fullName avatar')
        .populate('to', 'fullName avatar');
      
      return res.status(200).json({
        success: true,
        message: 'Đã cập nhật đánh giá',
        data: populatedRating
      });
    }
    
    // Tạo đánh giá mới
    const newRating = await Rating.create({
      from: req.user.id,
      to: req.params.id,
      rating,
      comment
    });
    
    const populatedRating = await Rating.findById(newRating._id)
      .populate('from', 'fullName avatar')
      .populate('to', 'fullName avatar');
    
    res.status(201).json({
      success: true,
      message: 'Đã đánh giá huấn luyện viên',
      data: populatedRating
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

// @desc    Lấy tất cả đánh giá của một huấn luyện viên
// @route   GET /api/trainers/:id/ratings
// @access  Public
exports.getTrainerRatings = async (req, res, next) => {
  try {
    // Check if trainer exists
    const trainer = await User.findOne({
      _id: req.params.id,
      role: 'trainer'
    });
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy huấn luyện viên'
      });
    }
    
    // Get ratings for this trainer
    const ratings = await Rating.find({ to: req.params.id })
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