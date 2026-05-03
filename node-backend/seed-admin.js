const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/petguardian');
    
    const adminEmail = 'admin@petguardian.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: adminEmail,
        passwordHash: 'admin123',
        fullName: 'System Administrator',
        phoneNumber: '0000000000',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@petguardian.com');
      console.log('Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists.');
      // Ensure the role is admin
      adminExists.role = 'admin';
      await adminExists.save();
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
    process.exit(1);
  }
};

seedAdmin();
