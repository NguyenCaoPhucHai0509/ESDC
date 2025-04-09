const Equipment = require('../models/Equipment');
const fs = require('fs');
const path = require('path');

// @desc    Lấy tất cả thiết bị
// @route   GET /api/equipment
// @access  Private
exports.getEquipment = async (req, res, next) => {
  try {
    let query = {};
    
    // Lọc theo trạng thái
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Lọc theo loại
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    const equipment = await Equipment.find(query);

    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết một thiết bị
// @route   GET /api/equipment/:id
// @access  Private
exports.getSingleEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      });
    }

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo thiết bị mới
// @route   POST /api/equipment
// @access  Private/Admin
exports.createEquipment = async (req, res, next) => {
  try {
    // Thêm đường dẫn ảnh nếu có
    if (req.file) {
      req.body.image = req.file.filename;
    }
    
    const equipment = await Equipment.create(req.body);

    res.status(201).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật thiết bị
// @route   PUT /api/equipment/:id
// @access  Private/Admin
exports.updateEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      });
    }
    
    // Thêm đường dẫn ảnh nếu có upload mới
    if (req.file) {
      // Xóa ảnh cũ nếu có
      if (equipment.image) {
        const oldImagePath = path.join(__dirname, '../uploads', equipment.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      req.body.image = req.file.filename;
    }
    
    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedEquipment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa thiết bị
// @route   DELETE /api/equipment/:id
// @access  Private/Admin
exports.deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      });
    }
    
    // Xóa ảnh nếu có
    if (equipment.image) {
      const imagePath = path.join(__dirname, '../uploads', equipment.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await equipment.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload ảnh thiết bị
// @route   PUT /api/equipment/:id/image
// @access  Private/Admin
exports.uploadEquipmentImage = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thiết bị'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file ảnh'
      });
    }
    
    // Xóa ảnh cũ nếu có
    if (equipment.image) {
      const oldImagePath = path.join(__dirname, '../uploads', equipment.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    equipment.image = req.file.filename;
    await equipment.save();

    res.status(200).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    next(error);
  }
};