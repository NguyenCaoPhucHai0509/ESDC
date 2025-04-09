const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Mỗi người chỉ có thể đánh giá một người khác một lần
RatingSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);