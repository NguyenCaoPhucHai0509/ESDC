const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Get messages from a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    // Find conversation first
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }
    
    // Check if user is part of the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là thành viên của cuộc trò chuyện này'
      });
    }
    
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
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tin nhắn không được để trống'
      });
    }

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }

    // Check if user is part of this conversation
    if (!conversation.participants.includes(req.user._id)) {
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
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'fullName avatar');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
};

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

    // Check if user has permission to delete the message
    if (message.sender.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tin nhắn này'
      });
    }

    // Check if this is the latest message in the conversation
    const conversation = await Conversation.findById(message.conversation);
    
    if (conversation && conversation.latestMessage && 
        conversation.latestMessage.toString() === message._id.toString()) {
      // Find the previous message
      const previousMessage = await Message.findOne({
        conversation: message.conversation,
        _id: { $ne: message._id }
      }).sort({ createdAt: -1 });
      
      // Update conversation's latest message
      if (previousMessage) {
        await Conversation.findByIdAndUpdate(message.conversation, {
          latestMessage: previousMessage._id
        });
      } else {
        // If no other messages, set latestMessage to null
        await Conversation.findByIdAndUpdate(message.conversation, {
          latestMessage: null
        });
      }
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
};

// @desc    Mark conversation as read
// @route   PUT /api/messages/read/:conversationId
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    // Find conversation
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuộc trò chuyện'
      });
    }
    
    // Check if user is part of the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là thành viên của cuộc trò chuyện này'
      });
    }
    
    // Mark all messages as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        readBy: { $ne: req.user._id }
      },
      {
        $addToSet: { readBy: req.user._id }
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả tin nhắn là đã đọc'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    // Find all conversations the user is part of
    const conversations = await Conversation.find({
      participants: req.user._id
    });
    
    const conversationIds = conversations.map(c => c._id);
    
    // Count unread messages
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user._id },
      readBy: { $ne: req.user._id }
    });
    
    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: err.message
    });
  }
};