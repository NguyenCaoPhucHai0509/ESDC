const express = require('express');
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Route đăng ký cho admin/lễ tân
router.post('/register', protect, authController.register);

// Route đăng ký công khai (chỉ tạo tài khoản khách hàng)
router.post('/register/public', (req, res, next) => {
  req.body.role = 'customer';
  authController.register(req, res, next);
});

router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.get('/logout', protect, authController.logout);
router.put('/profile', protect, authController.updateProfile);
router.put('/password', protect, authController.changePassword);

module.exports = router;