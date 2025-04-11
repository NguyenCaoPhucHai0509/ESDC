const User = require('../models/User');
const TrainerRequest = require('../models/TrainerRequest');

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private
exports.getTrainers = async (req, res, next) => {
  try {
    const trainers = await User.find({ role: 'trainer' });

    res.status(200).json({
      success: true,
      count: trainers.length,
      data: trainers
    });
  } catch (error) {
    next(error);
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
    });

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy huấn luyện viên'
      });
    }

    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trainer profile
// @route   PUT /api/trainers/profile
// @access  Private/Trainer
exports.updateTrainerProfile = async (req, res, next) => {
  try {
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
    next(error);
  }
};

// @desc    Khách hàng gửi yêu cầu huấn luyện viên
// @route   POST /api/trainers/request/:trainerId
// @access  Private/Customer
exports.requestTrainer = async (req, res, next) => {
  try {
    const { message } = req.body;
    
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
    next(error);
  }
};

// @desc    Huấn luyện viên xác nhận/từ chối yêu cầu kết nối
// @route   PUT /api/trainers/respond/:requestId
// @access  Private/Trainer
exports.respondToTrainerRequest = async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' hoặc 'rejected'
    
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
    
    request.status = status;
    await request.save();
    
    // Nếu chấp nhận, cập nhật trainer cho customer
    if (status === 'accepted') {
      await User.findByIdAndUpdate(request.customer, {
        trainer: req.user.id
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
    next(error);
  }
};

// @desc    Lấy danh sách yêu cầu huấn luyện
// @route   GET /api/trainers/requests
// @access  Private/Trainer
exports.getTrainerRequests = async (req, res, next) => {
  try {
    // Nếu là huấn luyện viên, lấy các yêu cầu dành cho mình
    const requests = await TrainerRequest.find({ trainer: req.user.id })
      .populate('customer', 'fullName email avatar')
      .populate('trainer', 'fullName email avatar')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách khách hàng của huấn luyện viên
// @route   GET /api/trainers/customers
// @access  Private/Trainer
exports.getTrainerCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ 
      trainer: req.user.id,
      role: 'customer'
    });
    
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};