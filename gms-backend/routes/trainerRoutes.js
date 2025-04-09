const express = require('express');
const {
  getTrainers,
  getTrainer,
  updateTrainerProfile,
  getTrainerCustomers,
  requestTrainer,
  respondToRequest,
  getTrainerSchedule,
  updateTrainerSchedule
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Lấy danh sách và thông tin huấn luyện viên
router.get('/', protect, getTrainers);
router.get('/:id', protect, getTrainer);

// Cập nhật thông tin huấn luyện viên
router.put('/profile', protect, authorize('trainer'), updateTrainerProfile);

// Khách hàng yêu cầu huấn luyện viên
router.post('/request/:trainerId', protect, authorize('customer'), requestTrainer);

// Huấn luyện viên phản hồi yêu cầu
router.put('/respond/:requestId', protect, authorize('trainer'), respondToRequest);

// Quản lý lịch trình huấn luyện viên
router.get('/schedule', protect, authorize('trainer'), getTrainerSchedule);
router.put('/schedule', protect, authorize('trainer'), updateTrainerSchedule);

// Lấy danh sách khách hàng của huấn luyện viên
router.get('/customers', protect, authorize('trainer'), getTrainerCustomers);

module.exports = router;