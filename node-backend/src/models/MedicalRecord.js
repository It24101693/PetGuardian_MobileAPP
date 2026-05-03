const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    passportId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthPassport' },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    type: {
      type: String,
      enum: ['diagnosis', 'treatment', 'surgery', 'checkup', 'lab_result', 'ai_scan', 'other'],
      default: 'checkup',
    },
    diagnosis: { type: String, trim: true },
    treatment: { type: String, trim: true },
    recoveryStatus: { 
      type: String, 
      enum: ['Not Started', 'In Progress', 'Improving', 'Fully Recovered', 'Chronic'],
      default: 'Not Started'
    },
    medications: [{ name: String, dosage: String, frequency: String, duration: String }],
    recordDate: { type: Date, required: true, default: Date.now },
    veterinarianName: { type: String, trim: true },
    clinicName: { type: String, trim: true },
    cost: { type: Number, min: 0 },
    notes: { type: String },
    attachmentUrl: { type: String },
    followUpDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
