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
// @desc  Create user (admin)
// @route POST /api/users
const createUserByAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, role, username, phoneNumber } = req.body;
    
    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email, and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Validate phone number if provided
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/[\s\-()]/g, '');
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide a valid phone number (10-15 digits)' 
        });
      }
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Generate username from email if not provided
    const finalUsername = username || email.split('@')[0];

    // Validate username
    if (finalUsername.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be at least 3 characters' 
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(finalUsername)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username can only contain letters, numbers, and underscores' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username: finalUsername }] });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }

    // Create user with passwordHash field
    const userData = { 
      fullName, 
      email, 
      username: finalUsername,
      passwordHash: password, // Model expects passwordHash
      role: role || 'owner'
    };

    // Add phone number if provided
    if (phoneNumber) {
      userData.phoneNumber = phoneNumber;
    }

    const user = await User.create(userData);
    
    console.log('✅ User created successfully:', user.email);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Create user error:', error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `User with this ${field} already exists` 
      });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: errors.join(', ') 
      });
    }
    next(error);
  }
};

// @desc  Update user (admin)
// @route PUT /api/users/:id
const updateUserByAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, role, username, phoneNumber } = req.body;
    
    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Validation
    if (!fullName || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name and email are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Validate phone number if provided
    if (phoneNumber) {
      const cleanPhone = phoneNumber.replace(/[\s\-()]/g, '');
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide a valid phone number (10-15 digits)' 
        });
      }
    }

    // Validate password if provided
    if (password && password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Validate username if provided
    if (username) {
      if (username.length < 3) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username must be at least 3 characters' 
        });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username can only contain letters, numbers, and underscores' 
        });
      }
    }

    // Check if email or username is taken by another user
    if (email !== user.email || (username && username !== user.username)) {
      const existingUser = await User.findOne({ 
        _id: { $ne: req.params.id },
        $or: [
          { email: email },
          ...(username ? [{ username: username }] : [])
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email or username already taken by another user' 
        });
      }
    }

    // Update fields
    user.fullName = fullName;
    user.email = email;
    if (username) user.username = username;
    if (role) user.role = role;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    
    // Update password only if provided
    if (password) {
      user.passwordHash = password;
    }

    await user.save();
    
    console.log('✅ User updated successfully:', user.email);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Update user error:', error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `User with this ${field} already exists` 
      });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: errors.join(', ') 
      });
    }
    next(error);
  }
};

// @desc  Get user by ID (admin)
// @route GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ success: true, data: user });
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
  updateUserByAdmin,
  getUserById,
  deleteUserByAdmin
};
