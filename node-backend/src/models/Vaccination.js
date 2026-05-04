const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    passportId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthPassport' },
    vaccineName: { 
      type: String, 
      required: [true, 'Vaccine name is required'], 
      trim: true,
      minlength: [2, 'Vaccine name must be at least 2 characters']
    },
    dateGiven: { 
      type: Date, 
      required: [true, 'Date given is required'],
      max: [Date.now, 'Date given cannot be in the future']
    },
    nextDueDate: { type: Date },
    batchNumber: { type: String, trim: true },
    veterinarianName: { type: String, trim: true },
    clinicName: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: [500, 'Notes cannot exceed 500 characters'] },
    status: {
      type: String,
      enum: ['given', 'due', 'overdue'],
      default: 'given',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vaccination', vaccinationSchema);
