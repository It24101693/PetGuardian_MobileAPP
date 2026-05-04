const HealthPassport = require('../models/HealthPassport');
const Vaccination = require('../models/Vaccination');
const MedicalRecord = require('../models/MedicalRecord');
const Pet = require('../models/Pet');

// @desc  Get health passport by pet ID
// @route GET /api/health/pet/:petId
const getPassportByPetId = async (req, res, next) => {
  try {
    let passport = await HealthPassport.findOne({ petId: req.params.petId });
    if (!passport) {
      passport = await HealthPassport.create({ petId: req.params.petId });
    }
    const vaccinations = await Vaccination.find({ petId: req.params.petId }).sort({ dateGiven: -1 });
    const medicalRecords = await MedicalRecord.find({ petId: req.params.petId }).sort({ recordDate: -1 });
    res.json({ success: true, data: { passport, vaccinations, medicalRecords } });
  } catch (error) {
    next(error);
  }
};

// @desc  Update health passport
// @route PUT /api/health/:id
const updatePassport = async (req, res, next) => {
  try {
    const passport = await HealthPassport.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!passport) return res.status(404).json({ success: false, message: 'Passport not found.' });
    res.json({ success: true, data: passport });
  } catch (error) {
    next(error);
  }
};

// @desc  Add vaccination
// @route POST /api/health/:passportId/vaccinations
const addVaccination = async (req, res, next) => {
  try {
    const passport = await HealthPassport.findById(req.params.passportId);
    if (!passport) return res.status(404).json({ success: false, message: 'Passport not found.' });
    const vaccination = await Vaccination.create({ ...req.body, petId: passport.petId, passportId: passport._id });
    // Update pet status if vaccination is due
    if (vaccination.nextDueDate && new Date(vaccination.nextDueDate) < new Date()) {
      await Pet.findByIdAndUpdate(passport.petId, { status: 'vaccine_due' });
    }
    res.status(201).json({ success: true, data: vaccination });
  } catch (error) {
    next(error);
  }
};

// @desc  Update vaccination
// @route PUT /api/health/vaccinations/:id
const updateVaccination = async (req, res, next) => {
  try {
    const vaccination = await Vaccination.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vaccination) return res.status(404).json({ success: false, message: 'Vaccination not found.' });
    res.json({ success: true, data: vaccination });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete vaccination
// @route DELETE /api/health/vaccinations/:id
const deleteVaccination = async (req, res, next) => {
  try {
    const vaccination = await Vaccination.findByIdAndDelete(req.params.id);
    if (!vaccination) return res.status(404).json({ success: false, message: 'Vaccination not found.' });
    res.json({ success: true, message: 'Vaccination deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc  Add medical record
// @route POST /api/health/:passportId/records
const addMedicalRecord = async (req, res, next) => {
  try {
    const passport = await HealthPassport.findById(req.params.passportId);
    if (!passport) return res.status(404).json({ success: false, message: 'Passport not found.' });
    
    console.log('📝 Creating medical record with data:', JSON.stringify(req.body, null, 2));
    
    const record = await MedicalRecord.create({ ...req.body, petId: passport.petId, passportId: passport._id });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error('❌ Medical record creation error:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }
    next(error);
  }
};

// @desc  Update medical record
// @route PUT /api/health/records/:id
const updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete medical record
// @route DELETE /api/health/records/:id
const deleteMedicalRecord = async (req, res, next) => {
  try {
    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Medical record deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc  Add allergy to passport
// @route POST /api/health/:passportId/allergies
const addAllergy = async (req, res, next) => {
  try {
    console.log('🔍 Adding allergy with data:', JSON.stringify(req.body, null, 2));
    
    const passport = await HealthPassport.findByIdAndUpdate(
      req.params.passportId,
      { $push: { allergies: req.body } },
      { new: true, runValidators: true }
    );
    if (!passport) return res.status(404).json({ success: false, message: 'Passport not found.' });
    
    console.log('✅ Allergy added successfully');
    res.status(201).json({ success: true, data: passport });
  } catch (error) {
    console.error('❌ Allergy creation error:', error.message);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }
    next(error);
  }
};

// @desc  Delete allergy from passport
// @route DELETE /api/health/:passportId/allergies/:allergyId
const deleteAllergy = async (req, res, next) => {
  try {
    const passport = await HealthPassport.findByIdAndUpdate(
      req.params.passportId,
      { $pull: { allergies: { _id: req.params.allergyId } } },
      { new: true }
    );
    if (!passport) return res.status(404).json({ success: false, message: 'Passport not found.' });
    res.json({ success: true, data: passport });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPassportByPetId, updatePassport,
  addVaccination, updateVaccination, deleteVaccination,
  addMedicalRecord, updateMedicalRecord, deleteMedicalRecord,
  addAllergy, deleteAllergy,
};
