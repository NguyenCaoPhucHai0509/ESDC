const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Membership = require('./models/Membership');
const Equipment = require('./models/Equipment');
const Event = require('./models/Event');

dotenv.config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {});

// Tạo password hash
const password = 'admin123';
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(password, salt);

// Dữ liệu mẫu
const seedDatabase = async () => {
  try {
    // Xoá dữ liệu cũ
    // await User.deleteMany({role: {$ne: 'admin'}});
    // await Membership.deleteMany({});
    // await Equipment.deleteMany({});
    // await Event.deleteMany({});

    // Thêm Lễ tân
    const receptionist = await User.create({
      fullName: "Lễ Tân",
      email: "receptionist@example.com",
      password: hashedPassword,
      phoneNumber: "0987654321",
      address: "Hà Nội",
      role: "receptionist"
    });
    console.log('Đã tạo lễ tân:', receptionist.email);

    // Thêm Huấn luyện viên
    const trainer = await User.create({
      fullName: "Huấn Luyện Viên 1",
      email: "trainer1@example.com",
      password: hashedPassword,
      phoneNumber: "0123456789",
      address: "Hà Nội",
      role: "trainer",
      specialization: "Fitness",
      experience: 3,
      bio: "Chuyên gia về fitness với hơn 3 năm kinh nghiệm"
    });
    console.log('Đã tạo huấn luyện viên:', trainer.email);

    // Thêm Khách hàng
    const customer = await User.create({
      fullName: "Khách Hàng 1",
      email: "customer1@example.com",
      password: hashedPassword,
      phoneNumber: "0369852147",
      address: "Hà Nội",
      role: "customer"
    });
    console.log('Đã tạo khách hàng:', customer.email);

    // Tạo gói tập
    const memberships = await Membership.insertMany([
      {
        name: "Gói 1 tháng",
        description: "Gói tập cơ bản trong 1 tháng",
        duration: 1,
        price: 350000,
        features: ["Sử dụng tất cả các thiết bị", "Phòng tắm", "Nước uống miễn phí"],
        isActive: true
      },
      {
        name: "Gói 3 tháng",
        description: "Gói tập tiết kiệm trong 3 tháng",
        duration: 3,
        price: 950000,
        features: ["Sử dụng tất cả các thiết bị", "Phòng tắm", "Nước uống miễn phí", "1 buổi tư vấn với HLV"],
        isActive: true
      }
    ]);
    console.log('Đã tạo gói tập:', memberships.length);

    console.log('Hoàn thành việc tạo dữ liệu!');
    process.exit();
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
};

seedDatabase();