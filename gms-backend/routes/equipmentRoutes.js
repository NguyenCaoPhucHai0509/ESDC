const express = require('express');
const {
  getEquipment,
  getSingleEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  uploadEquipmentImage
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .get(protect, getEquipment)
  .post(protect, authorize('admin'), upload.single('image'), createEquipment);

router
  .route('/:id')
  .get(protect, getSingleEquipment)
  .put(protect, authorize('admin'), upload.single('image'), updateEquipment)
  .delete(protect, authorize('admin'), deleteEquipment);

router.route('/:id/image').put(
  protect, 
  authorize('admin'), 
  upload.single('image'), 
  uploadEquipmentImage
);

module.exports = router;