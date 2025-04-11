const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { timestamps: true });

// Indexes for better query performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });
ConversationSchema.index({ isGroupChat: 1 });

// Virtual for chat name
ConversationSchema.virtual('chatName').get(function() {
  if (this.isGroupChat) {
    return this.groupName;
  }
  
  // For personal chats, we can't determine the name without knowing the current user
  return 'Personal Chat';
});

// Method to get conversation name for a specific user
ConversationSchema.methods.getChatNameForUser = function(userId) {
  if (this.isGroupChat) {
    return this.groupName;
  }
  
  // For personal chats, find the other participant
  if (this.participants && this.participants.length > 0) {
    const otherParticipant = this.participants.find(
      p => p._id.toString() !== userId.toString()
    );
    
    if (otherParticipant) {
      return otherParticipant.fullName || 'Người dùng';
    }
  }
  
  return 'Personal Chat';
};

// Method to check if a user is a participant
ConversationSchema.methods.isUserParticipant = function(userId) {
  return this.participants.some(
    p => p.toString() === userId.toString() || 
         (p._id && p._id.toString() === userId.toString())
  );
};

// Add toJSON method to convert to a plain object with virtuals
ConversationSchema.set('toJSON', { virtuals: true });
ConversationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Conversation', ConversationSchema);