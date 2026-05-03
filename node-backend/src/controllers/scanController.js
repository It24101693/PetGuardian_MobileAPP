const axios = require('axios');
const SymptomScan = require('../models/SymptomScan');
const FormData = require('form-data');
const fs = require('fs');

// @desc  Get scans by pet ID
// @route GET /api/scans/pet/:petId
const getScansByPet = async (req, res, next) => {
  try {
    const scans = await SymptomScan.find({ petId: req.params.petId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, count: scans.length, data: scans });
  } catch (error) {
    next(error);
  }
};

// @desc  Create scan (upload image + call AI service)
// @route POST /api/scans
const createScan = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image file is required.' });

    const imageUrl = req.file.path;
    const imagePublicId = req.file.filename;

    // Call Python AI service
    let aiResult = { predictedDisease: 'Unknown', confidence: 0, allPredictions: [], recommendations: [] };
    try {
      const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
      const formData = new FormData();

      // If file is from Cloudinary, we pass the URL; AI service must support URL or use local temp
      // For Cloudinary uploads, pass the image URL to the AI service
      const aiResponse = await axios.post(`${AI_URL}/predict`, { image_url: imageUrl }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      });

      if (aiResponse.data) {
        const d = aiResponse.data;
        aiResult.predictedDisease = d.disease || d.predicted_class || 'Unknown';
        aiResult.confidence = d.confidence ? Math.round(d.confidence * 100) : 0;
        aiResult.allPredictions = d.all_predictions || [];
        aiResult.recommendations = d.recommendations || [];
        aiResult.isEmergency = d.is_emergency || false;
        aiResult.severity = d.severity || 'low';
      }
    } catch (aiError) {
      console.warn('⚠️ AI service unavailable, saving scan without AI result:', aiError.message);
    }

    const scan = await SymptomScan.create({
      petId: req.body.petId,
      userId: req.user._id,
      imageUrl,
      imagePublicId,
      ...aiResult,
      notes: req.body.notes,
    });

    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    next(error);
  }
};

// @desc  Update scan severity/notes
// @route PUT /api/scans/:id
const updateScan = async (req, res, next) => {
  try {
    const scan = await SymptomScan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!scan) return res.status(404).json({ success: false, message: 'Scan not found.' });
    res.json({ success: true, data: scan });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete scan
// @route DELETE /api/scans/:id
const deleteScan = async (req, res, next) => {
  try {
    await SymptomScan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Scan deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getScansByPet, createScan, updateScan, deleteScan };
