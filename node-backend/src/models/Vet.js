const mongoose = require('mongoose');

const vetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: [true, 'Vet name is required'], trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    clinicName: { type: String, trim: true },
    specialization: [{ type: String }],
    address: { type: String },
    city: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    workingHours: {
      monday: String, tuesday: String, wednesday: String,
      thursday: String, friday: String, saturday: String, sunday: String,
    },
    isEmergency: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    profileImageUrl: { type: String },
    licenseNumber: { type: String },
    bio: { type: String },
    doctors: [
      {
        name: { type: String, required: true },
        specialization: { type: String },
        experience: { type: String },
        availableDays: [{ type: String }], // ['Monday', 'Wednesday']
      }
    ],
    availableSlots: [
      {
        time: { type: String, required: true }, // '09:00 AM'
        isBooked: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

vetSchema.index({ location: '2dsphere' });
vetSchema.index({ isEmergency: 1 });

module.exports = mongoose.model('Vet', vetSchema);
