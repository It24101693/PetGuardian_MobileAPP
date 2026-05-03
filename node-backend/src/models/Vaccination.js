const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    passportId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthPassport' },
    name: { type: String, required: [true, 'Vaccine name is required'], trim: true },
    dateGiven: { type: Date, required: [true, 'Date given is required'] },
    nextDueDate: { type: Date },
    batchNumber: { type: String, trim: true },
    administeredBy: { type: String, trim: true },
    clinicName: { type: String, trim: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['given', 'due', 'overdue'],
      default: 'given',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vaccination', vaccinationSchema);
