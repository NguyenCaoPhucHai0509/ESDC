const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Lấy tất cả cuộc hội thoại của người dùng
// @route   GET /api/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    // Tìm các cuộc trò chuyện có người dùng này tham gia
    let conversations = await Conversation.find({
      participants: { $elemMatch: { $eq: req.user._id } }
    })
      .populate('participants', 'fullName avatar')
      .populate('groupAdmin', 'fullName')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    // Populate thêm thông tin người gửi của tin nhắn cuối cùng
    if (conversations.length > 0) {
      conversations = await User.populate(conversations, {
        path: 'latestMessage.sender',
        select: 'fullName avatar',
      });
    }

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo một cuộc hội thoại 1-1
// @route   POST /api/conversations
// @access  Private
exports.createConversation = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người dùng'
      });
    }

    // Kiểm tra xem đã có cuộc trò chuyện 1-1 với người dùng này chưa
    const existingConversation = await Conversation.findOne({
      isGroupChat: false,
      participants: {
        $all: [req.user._id, userId],
        $size: 2
      }
    })
      .populate('participants', 'fullName avatar')
      .populate('latestMessage');

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        data: existingConversation
      });
    }

    // Tạo cuộc trò chuyện mới
    const conversation = await Conversation.create({
      participants: [req.user._id, userId],
      isGroupChat: false
    });

    // Lấy thông tin đầy đủ cho response
    const fullConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'fullName avatar');

    res.status(201).json({
      success: true,
      data: fullConversation
    });
  } catch (error) {
    next(error);
  }
};

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
    
    // Tạo group chat mới
    const groupChat = await Conversation.create({
      groupName: name,
      participants: [...participants, req.user.id], // Thêm người tạo vào nhóm
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

// @desc    Cập nhật thông tin group chat
// @route   PUT /api/conversations/group/:id
// @access  Private
exports.updateGroupChat = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    // Tìm cuộc trò chuyện nhóm
    const groupChat = await Conversation.findById(req.params.id);
    
    if (!groupChat) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }
    
    // Kiểm tra quyền cập nhật (phải là admin của nhóm)
    if (groupChat.groupAdmin.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật nhóm này'
      });
    }
    
    groupChat.groupName = name || groupChat.groupName;
    await groupChat.save();
    
    const updatedGroupChat = await Conversation.findById(groupChat._id)
      .populate('participants', 'fullName avatar')
      .populate('groupAdmin', 'fullName');
    
    res.status(200).json({
      success: true,
      data: updatedGroupChat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm người dùng vào nhóm
// @route   POST /api/conversations/group/:id/add
// @access  Private
exports.addToGroup = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    // Tìm cuộc trò chuyện nhóm
    const groupChat = await Conversation.findById(req.params.id);
    
    if (!groupChat) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }
    
    // Kiểm tra quyền thêm người (phải là admin của nhóm)
    if (groupChat.groupAdmin.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thêm người vào nhóm này'
      });
    }
    
    // Kiểm tra người dùng đã có trong nhóm chưa
    if (groupChat.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng đã có trong nhóm'
      });
    }
    
    // Thêm người dùng vào nhóm
    groupChat.participants.push(userId);
    await groupChat.save();
    
    const updatedGroupChat = await Conversation.findById(groupChat._id)
      .populate('participants', 'fullName avatar')
      .populate('groupAdmin', 'fullName');
    
    res.status(200).json({
      success: true,
      data: updatedGroupChat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa người dùng khỏi nhóm
// @route   POST /api/conversations/group/:id/remove
// @access  Private
exports.removeFromGroup = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    // Tìm cuộc trò chuyện nhóm
    const groupChat = await Conversation.findById(req.params.id);
    
    if (!groupChat) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }
    
    // Kiểm tra quyền xóa người (phải là admin của nhóm)
    if (groupChat.groupAdmin.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa người khỏi nhóm này'
      });
    }
    
    // Không cho phép xóa admin của nhóm
    if (userId === groupChat.groupAdmin.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa người quản lý nhóm'
      });
    }
    
    // Xóa người dùng khỏi nhóm
    groupChat.participants = groupChat.participants.filter(
      p => p.toString() !== userId
    );
    await groupChat.save();
    
    const updatedGroupChat = await Conversation.findById(groupChat._id)
      .populate('participants', 'fullName avatar')
      .populate('groupAdmin', 'fullName');
    
    res.status(200).json({
      success: true,
      data: updatedGroupChat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rời khỏi nhóm
// @route   POST /api/conversations/group/:id/leave
// @access  Private
exports.leaveGroup = async (req, res, next) => {
  try {
    // Tìm cuộc trò chuyện nhóm
    const groupChat = await Conversation.findById(req.params.id);
    
    if (!groupChat) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }
    
    // Kiểm tra người dùng có trong nhóm không
    if (!groupChat.participants.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không phải là thành viên của nhóm này'
      });
    }
    
    // Nếu là admin của nhóm, không cho phép rời nhóm, phải chuyển quyền admin trước
    if (groupChat.groupAdmin.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Bạn là người quản lý nhóm, vui lòng chuyển quyền quản lý trước khi rời nhóm'
      });
    }
    
    // Xóa người dùng khỏi nhóm
    groupChat.participants = groupChat.participants.filter(
      p => p.toString() !== req.user.id
    );
    await groupChat.save();
    
    const updatedGroupChat = await Conversation.findById(groupChat._id)
      .populate('participants', 'fullName avatar')
      .populate('groupAdmin', 'fullName');
    
    res.status(200).json({
      success: true,
      data: updatedGroupChat
    });
  } catch (error) {
    next(error);
  }
};