const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('No MongoDB URI found in environment variables (checked MONGO_URI and MONGODB_URI)');
    }
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    const maskedUri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED';
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`🔗 Attempted URI: ${maskedUri}`);
    process.exit(1);
  }
};

module.exports = connectDB;
