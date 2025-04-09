const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadAvatar
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin', 'receptionist'), getUsers)
  .post(protect, authorize('admin', 'receptionist'), createUser);

router
  .route('/:id')
  .get(protect, authorize('admin', 'receptionist'), getUser)
  .put(protect, authorize('admin', 'receptionist'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.route('/:id/avatar').put(protect, uploadAvatar);

module.exports = router;