const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề sự kiện']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sự kiện']
  },
  startDate: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày bắt đầu']
  },
  endDate: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày kết thúc']
  },
  location: {
    type: String
  },
  image: {
    type: String
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      registered: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['đã đăng ký', 'đã tham gia', 'đã hủy'],
        default: 'đã đăng ký'
      }
    }
  ],
  maxParticipants: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);