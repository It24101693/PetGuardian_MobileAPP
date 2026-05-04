const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    passportId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthPassport' },
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: [3, 'Title must be at least 3 characters'] },
    type: {
      type: String,
      enum: ['diagnosis', 'treatment', 'surgery', 'checkup', 'lab_result', 'ai_scan', 'other'],
      default: 'checkup',
    },
    diagnosis: { type: String, trim: true, maxlength: [1000, 'Diagnosis cannot exceed 1000 characters'] },
    treatment: { type: String, trim: true, maxlength: [1000, 'Treatment cannot exceed 1000 characters'] },
    recoveryStatus: { 
      type: String, 
      enum: ['Not Started', 'In Progress', 'Improving', 'Fully Recovered', 'Chronic'],
      default: 'Not Started'
    },
    medications: { type: String, trim: true },
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
