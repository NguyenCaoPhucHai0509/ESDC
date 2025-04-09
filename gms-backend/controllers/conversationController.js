// @desc    Admin tạo group chat
// @route   POST /api/conversations/group
// @access  Private/Admin
exports.createGroupChat = async (req, res, next) => {
  try {
    const { name, participants } = req.body;
    
    if (!name || !participants || participants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên nhóm và ít nhất 2 thành viên'
      });
    }
    
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có thể tạo nhóm chat mới'
      });
    }
    
    // Tạo group chat mới
    const groupChat = await Conversation.create({
      groupName: name,
      participants: [...participants, req.user.id], // Thêm admin vào nhóm
      isGroupChat: true,
      groupAdmin: req.user.id
    });
    
    const fullGroupChat = await Conversation.findById(groupChat._id)
      .populate('participants', 'fullName avatar')
      .populate('groupAdmin', 'fullName');
    
    res.status(201).json({
      success: true,
      data: fullGroupChat
    });
  } catch (error) {
    next(error);
  }
};