const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên gói tập']
  },
  description: {
    type: String
  },
  duration: {
    type: Number,
    required: [true, 'Vui lòng nhập thời hạn (tháng)']
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá tiền']
  },
  features: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Membership', MembershipSchema);