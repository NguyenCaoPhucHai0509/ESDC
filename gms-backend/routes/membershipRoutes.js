const express = require('express');
const {
  getMemberships,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership
} = require('../controllers/membershipController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getMemberships)
  .post(protect, authorize('admin'), createMembership);

router
  .route('/:id')
  .get(getMembership)
  .put(protect, authorize('admin'), updateMembership)
  .delete(protect, authorize('admin'), deleteMembership);

module.exports = router;