const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { uploadProfileImage } = require('../config/cloudinary');
const { 
  getProfile, 
  updateProfile, 
  getAllUsers, 
  getAdminStats, 
  toggleUserStatus,
  createUserByAdmin,
  updateUserByAdmin,
  getUserById,
  deleteUserByAdmin 
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadProfileImage.single('profileImage'), updateProfile);

// Admin routes
router.use(protect, authorize('admin'));
router.get('/admin/stats', getAdminStats);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUserByAdmin);
router.put('/:id', updateUserByAdmin);
router.delete('/:id', deleteUserByAdmin);
router.put('/:id/toggle-status', toggleUserStatus);

module.exports = router;
