const express = require('express');
const {
  getConversations,
  createConversation,
  createGroupChat,
  updateGroupChat,
  addToGroup,
  removeFromGroup,
  leaveGroup
} = require('../controllers/conversationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getConversations)
  .post(protect, createConversation);

// Comment dòng này lại nếu getConversation chưa được triển khai
// router.route('/:id').get(protect, getConversation);

// Group chat routes
router.post('/group', protect, createGroupChat);
router.put('/group/:id', protect, updateGroupChat);
router.post('/group/:id/add', protect, addToGroup);
router.post('/group/:id/remove', protect, removeFromGroup);
router.post('/group/:id/leave', protect, leaveGroup);

module.exports = router;