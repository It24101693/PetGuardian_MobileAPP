const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendManualNotification
} = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.post('/', sendManualNotification);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
