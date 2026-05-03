const User = require('../models/User');
const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
const { cloudinary } = require('../config/cloudinary');

// @desc  Get my profile
// @route GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Update profile
// @route PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { username, email, password, ...allowedFields } = req.body; // prevent changing email/password here

    if (req.file) {
      if (req.user.profileImageUrl) {
        const publicId = req.user.profileImageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`petguardian/profiles/${publicId}`).catch(() => {});
      }
      allowedFields.profileImageUrl = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, allowedFields, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users (admin)
// @route GET /api/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc  Get admin dashboard stats
// @route GET /api/users/admin/stats
const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPets, totalAppointments, owners, vets] = await Promise.all([
      User.countDocuments(),
      Pet.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'veterinarian' }),
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentPets = await Pet.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).populate('ownerId', 'fullName');

    res.json({
      success: true,
      data: { totalUsers, totalPets, totalAppointments, owners, vets, recentUsers, recentPets },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Toggle user active status (admin)
// @route PUT /api/users/:id/toggle-status
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Create user (admin)
// @route POST /api/users
const createUserByAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'User already exists.' });

    const user = await User.create({ fullName, email, password, role });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete user (admin)
// @route DELETE /api/users/:id
const deleteUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    await user.deleteOne();
    res.json({ success: true, message: 'User removed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getProfile, 
  updateProfile, 
  getAllUsers, 
  getAdminStats, 
  toggleUserStatus,
  createUserByAdmin,
  deleteUserByAdmin
};
