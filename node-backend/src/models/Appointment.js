const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet' },
    vetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appointmentDate: { type: Date, required: [true, 'Appointment date is required'] },
    appointmentTime: { type: String },
    duration: { type: Number, default: 30 }, // minutes
    reason: { type: String, required: [true, 'Reason is required'], trim: true },
    type: {
      type: String,
      enum: ['checkup', 'vaccination', 'surgery', 'grooming', 'dental', 'emergency', 'follow_up', 'other'],
      default: 'checkup',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    notes: { type: String },
    vetNotes: { type: String },
    reminderSent: { type: Boolean, default: false },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

appointmentSchema.index({ ownerId: 1, appointmentDate: 1 });
appointmentSchema.index({ vetId: 1, appointmentDate: 1 });
appointmentSchema.index({ petId: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
