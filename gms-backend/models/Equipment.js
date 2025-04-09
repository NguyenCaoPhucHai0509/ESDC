const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên thiết bị']
  },
  description: {
    type: String
  },
  category: {
    type: String,
    required: [true, 'Vui lòng nhập loại thiết bị']
  },
  purchaseDate: {
    type: Date
  },
  cost: {
    type: Number
  },
  status: {
    type: String,
    enum: ['hoạt động', 'bảo trì', 'hỏng'],
    default: 'hoạt động'
  },
  location: {
    type: String
  },
  image: {
    type: String
  },
  maintenanceSchedule: [
    {
      date: Date,
      description: String,
      status: {
        type: String,
        enum: ['đã hoàn thành', 'đang chờ', 'đã hủy'],
        default: 'đang chờ'
      }
    }
  ],
  serialNumber: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Equipment', EquipmentSchema);