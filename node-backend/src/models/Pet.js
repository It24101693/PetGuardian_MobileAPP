const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
      maxlength: [100, 'Pet name cannot exceed 100 characters'],
    },
    species: {
      type: String,
      required: [true, 'Species is required'],
      trim: true,
      maxlength: [50],
    },
    breed: {
      type: String,
      trim: true,
      maxlength: [100],
    },
    dateOfBirth: {
      type: Date,
    },
    age: {
      type: Number,
      min: [0, 'Age must be non-negative'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown',
    },
    bloodType: {
      type: String,
      maxlength: [20],
    },
    weight: {
      type: Number,
      min: [0, 'Weight must be positive'],
    },
    color: {
      type: String,
      maxlength: [50],
    },
    microchipNumber: {
      type: String,
      unique: true,
      sparse: true,
      maxlength: [50],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    qrCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    allergies: {
      type: String,
      maxlength: [1000],
    },
    emergencyNotes: {
      type: String,
    },
    emergencyContact: {
      type: String,
      maxlength: [150],
    },
    status: {
      type: String,
      enum: ['healthy', 'vaccine_due', 'attention_needed'],
      default: 'healthy',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

petSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Pet', petSchema);
