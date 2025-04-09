const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Route đăng ký cho admin/lễ tân
router.post('/register', protect, register);

// Route đăng ký công khai (chỉ tạo tài khoản khách hàng)
router.post('/register/public', (req, res, next) => {
  req.body.role = 'customer';
  register(req, res, next);
});

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;