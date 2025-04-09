const Event = require('../models/Event');
const fs = require('fs');
const path = require('path');

// @desc    Lấy tất cả sự kiện
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    // Lọc sự kiện
    let query = {};
    
    // Lọc theo sự kiện sắp tới
    if (req.query.upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }
    
    // Sắp xếp theo ngày bắt đầu
    const events = await Event.find(query)
      .populate('organizer', 'fullName')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết sự kiện
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'fullName email')
      .populate('participants.user', 'fullName email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo sự kiện mới
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res, next) => {
  try {
    // Thêm người tổ chức
    req.body.organizer = req.user.id;
    
    // Thêm đường dẫn ảnh nếu có
    if (req.file) {
      req.body.image = req.file.filename;
    }
    
    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật sự kiện
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }
    
    // Thêm đường dẫn ảnh nếu có upload mới
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (event.image) {
        const oldImagePath = path.join(__dirname, '../uploads', event.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      req.body.image = req.file.filename;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa sự kiện
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }
    
    // Xóa ảnh nếu có
    if (event.image) {
      const imagePath = path.join(__dirname, '../uploads', event.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đăng ký tham gia sự kiện
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }
    
    // Kiểm tra đã đăng ký chưa
    if (event.participants.some(p => p.user.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký tham gia sự kiện này'
      });
    }
    
    // Kiểm tra số lượng tham gia tối đa
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Sự kiện đã đủ số lượng người tham gia'
      });
    }
    
    // Thêm vào danh sách tham gia
    event.participants.push({
      user: req.user.id,
      status: 'đã đăng ký'
    });
    
    await event.save();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hủy đăng ký sự kiện
// @route   DELETE /api/events/:id/register
// @access  Private
exports.cancelRegistration = async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);
  
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sự kiện'
        });
      }
      
      // Kiểm tra người dùng đã đăng ký chưa
      const participantIndex = event.participants.findIndex(
        p => p.user.toString() === req.user.id
      );
      
      if (participantIndex === -1) {
        return res.status(400).json({
          success: false,
          message: 'Bạn chưa đăng ký tham gia sự kiện này'
        });
      }
      
      // Xóa khỏi danh sách tham gia
      event.participants.splice(participantIndex, 1);
      await event.save();
  
      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  };
  
  // @desc    Lấy danh sách người tham gia sự kiện
  // @route   GET /api/events/:id/participants
  // @access  Private/Admin
  exports.getEventParticipants = async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id)
        .populate('participants.user', 'fullName email phoneNumber avatar');
  
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sự kiện'
        });
      }
  
      res.status(200).json({
        success: true,
        count: event.participants.length,
        data: event.participants
      });
    } catch (error) {
      next(error);
    }
  };
  
  // @desc    Upload ảnh sự kiện
  // @route   PUT /api/events/:id/image
  // @access  Private/Admin
  exports.uploadEventImage = async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);
  
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sự kiện'
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng upload file ảnh'
        });
      }
      
      // Xóa ảnh cũ nếu có
      if (event.image) {
        const oldImagePath = path.join(__dirname, '../uploads', event.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      event.image = req.file.filename;
      await event.save();
  
      res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  };