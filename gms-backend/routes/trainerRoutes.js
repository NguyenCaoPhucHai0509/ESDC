const express = require('express');
const {
  getTrainers,
  getTrainer,
  updateTrainerProfile,
  requestTrainer,
  respondToTrainerRequest,
  getTrainerRequests,
  getTrainerCustomers
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Lấy danh sách huấn luyện viên
router.get('/', protect, getTrainers);

// Lấy thông tin một huấn luyện viên
router.get('/:id', protect, getTrainer);

// Cập nhật thông tin huấn luyện viên
router.put('/profile', protect, authorize('trainer'), updateTrainerProfile);

// Khách hàng yêu cầu huấn luyện viên
router.post('/request/:trainerId', protect, authorize('customer'), requestTrainer);

// Huấn luyện viên phản hồi yêu cầu
router.put('/respond/:requestId', protect, authorize('trainer'), respondToTrainerRequest);

// Lấy danh sách yêu cầu huấn luyện
router.get('/requests', protect, authorize('trainer'), getTrainerRequests);

// Lấy danh sách khách hàng của huấn luyện viên
router.get('/customers', protect, authorize('trainer'), getTrainerCustomers);

module.exports = router;