const mongoose = require('mongoose');

const allergySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'], default: 'Mild' },
  reaction: { type: String },
  diagnosedDate: { type: Date },
});

const healthPassportSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
      unique: true,
    },
    bloodType: { type: String, maxlength: 20 },
    weight: { type: Number },
    height: { type: Number },
    allergies: [allergySchema],
    chronicConditions: [{ type: String }],
    currentMedications: [{ type: String }],
    dietaryRestrictions: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String },
    },
    emergencyNotes: { type: String },
    lastVetVisit: { type: Date },
    nextVetVisit: { type: Date },
    insuranceProvider: { type: String },
    insurancePolicyNumber: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HealthPassport', healthPassportSchema);
