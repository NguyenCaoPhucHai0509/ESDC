const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getEventParticipants,
  uploadEventImage
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .get(getEvents)
  .post(protect, authorize('admin'), upload.single('image'), createEvent);

router
  .route('/:id')
  .get(getEvent)
  .put(protect, authorize('admin'), upload.single('image'), updateEvent)
  .delete(protect, authorize('admin'), deleteEvent);

// Đăng ký và hủy đăng ký sự kiện
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);

// Lấy danh sách người tham gia
router.get('/:id/participants', protect, authorize('admin'), getEventParticipants);

// Upload ảnh cho sự kiện
router.put('/:id/image', protect, authorize('admin'), upload.single('image'), uploadEventImage);

module.exports = router;