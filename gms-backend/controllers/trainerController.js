// @desc    Huấn luyện viên xác nhận/từ chối yêu cầu kết nối
// @route   PUT /api/trainers/request/:requestId/respond
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
    
    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};