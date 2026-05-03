const express = require('express');
const { protect } = require('../middleware/auth');
const { sendChatMessage, getChatHistory } = require('../controllers/aiController');

const router = express.Router();

router.use(protect);

router.post('/chat', sendChatMessage);
router.get('/chat/history', getChatHistory);

module.exports = router;
