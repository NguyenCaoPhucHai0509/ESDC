const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Vui lòng nhập email hợp lệ'
    ]
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false
  },
  phoneNumber: {
    type: String,
    required: [true, 'Vui lòng nhập số điện thoại'],
    match: [/^[\d\s\+\-\(\)]{10,15}$/, 'Số điện thoại không hợp lệ']
  },
  address: {
    type: String
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'trainer', 'customer', 'receptionist'],
      message: 'Vai trò không hợp lệ'
    },
    default: 'customer'
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  membershipInfo: {
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Thông tin bổ sung cho huấn luyện viên
  specialization: {
    type: String // Chuyên môn huấn luyện
  },
  experience: {
    type: Number // Số năm kinh nghiệm
  },
  bio: {
    type: String // Giới thiệu ngắn
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add index to improve query performance
UserSchema.index({ role: 1 });
UserSchema.index({ email: 1 }, { unique: true });

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual field for isTrainer
UserSchema.virtual('isTrainer').get(function() {
  return this.role === 'trainer';
});

// Virtual field for isAdmin
UserSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// Virtual field for isReceptionist
UserSchema.virtual('isReceptionist').get(function() {
  return this.role === 'receptionist';
});

// Virtual field for isCustomer
UserSchema.virtual('isCustomer').get(function() {
  return this.role === 'customer';
});

// Virtual field for fullMembershipDuration
UserSchema.virtual('fullMembershipDuration').get(function() {
  if (!this.membershipInfo || !this.membershipInfo.startDate || !this.membershipInfo.endDate) {
    return null;
  }
  
  const startDate = new Date(this.membershipInfo.startDate);
  const endDate = new Date(this.membershipInfo.endDate);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Virtual field for membershipDaysLeft
UserSchema.virtual('membershipDaysLeft').get(function() {
  if (!this.membershipInfo || !this.membershipInfo.endDate) {
    return null;
  }
  
  const today = new Date();
  const endDate = new Date(this.membershipInfo.endDate);
  const diffTime = Math.abs(endDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Add toJSON method to convert to a plain object with virtuals
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);