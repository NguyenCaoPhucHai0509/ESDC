const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Get messages from a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId
    })
      .populate('sender', 'fullName avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    if (messages.length > 0) {
      await Message.updateMany(
        {
          conversation: req.params.conversationId,
          readBy: { $ne: req.user._id }
        },
        {
          $addToSet: { readBy: req.user._id }
        }
      );
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    next(err);
  }
};


// ...các hàm khác...

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin nhắn'
      });
    }

    // Kiểm tra xem người dùng có quyền xóa tin nhắn không
    if (message.sender.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tin nhắn này'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }

    // Check if user is part of this conversation
    if (!conversation.participants.includes(req.user._id) && 
        !(conversation.isGroupChat && req.user.role === 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là thành viên của cuộc trò chuyện này'
      });
    }

    // Create message
    const message = await Message.create({
      sender: req.user._id,
      content,
      conversation: conversationId,
      readBy: [req.user._id]
    });

    // Update latest message in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      latestMessage: message._id
    });

    // Populate message with sender info
    const populatedMessage = await Message.findById(message._id).populate('sender', 'fullName avatar');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (err) {
    next(err);
  }
};