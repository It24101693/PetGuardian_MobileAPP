const mongoose = require('mongoose');

const symptomScanSchema = new mongoose.Schema(
  {
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },
    // AI result fields
    predictedDisease: { type: String },
    confidence: { type: Number, min: 0, max: 100 },
    allPredictions: [
      { disease: String, confidence: Number },
    ],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'low',
    },
    isEmergency: { type: Boolean, default: false },
    recommendations: [{ type: String }],
    notes: { type: String },
    vetReviewed: { type: Boolean, default: false },
    vetNotes: { type: String },
  },
  { timestamps: true }
);

symptomScanSchema.index({ petId: 1, createdAt: -1 });
symptomScanSchema.index({ userId: 1 });

module.exports = mongoose.model('SymptomScan', symptomScanSchema);
