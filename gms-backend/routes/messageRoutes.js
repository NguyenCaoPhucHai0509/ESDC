const express = require('express');
const {
  sendMessage,
  getMessages,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:conversationId').get(protect, getMessages);
router.route('/:id').delete(protect, deleteMessage);

module.exports = router;