// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (for customers) / Private (for admin/receptionist creating other roles)
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, address, role } = req.body;

    // Kiểm tra quyền tạo tài khoản
    if (req.user && role) {
      // Nếu không phải admin và muốn tạo tài khoản admin
      if (req.user.role !== 'admin' && role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ có admin mới có thể tạo tài khoản admin khác'
        });
      }
      
      // Nếu là lễ tân và muốn tạo tài khoản không phải customer hoặc trainer
      if (req.user.role === 'receptionist' && role !== 'customer' && role !== 'trainer') {
        return res.status(403).json({
          success: false,
          message: 'Lễ tân chỉ có thể tạo tài khoản khách hàng và huấn luyện viên'
        });
      }
    }

    // Tạo tài khoản
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      address,
      role: role || 'customer'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};