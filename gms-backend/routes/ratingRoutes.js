const express = require('express');
const {
  createRating,
  getRatings,
  updateRating,
  deleteRating,
  getUserRatings
} = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .post(protect, createRating);

router
  .route('/:id')
  .put(protect, updateRating)
  .delete(protect, deleteRating);

// Lấy đánh giá của một người dùng
router.get('/user/:userId', protect, getUserRatings);

// Lấy tất cả đánh giá
router.get('/', protect, getRatings);

module.exports = router;