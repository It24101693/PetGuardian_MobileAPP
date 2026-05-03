const Vet = require('../models/Vet');

// @desc  Get all vets
// @route GET /api/vets
const getAllVets = async (req, res, next) => {
  try {
    const vets = await Vet.find({ isAvailable: true }).sort({ rating: -1 });
    res.json({ success: true, count: vets.length, data: vets });
  } catch (error) {
    next(error);
  }
};

// @desc  Get vet by ID
// @route GET /api/vets/:id
const getVetById = async (req, res, next) => {
  try {
    const vet = await Vet.findById(req.params.id);
    if (!vet) return res.status(404).json({ success: false, message: 'Vet not found.' });
    res.json({ success: true, data: vet });
  } catch (error) {
    next(error);
  }
};

// @desc  Get nearby vets (geospatial)
// @route GET /api/vets/nearby?lat=&lng=&radius=
const getNearbyVets = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat and lng query params are required.' });
    }
    const radiusInMeters = parseFloat(radius) * 1000;
    const vets = await Vet.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters,
        },
      },
      isAvailable: true,
    });
    res.json({ success: true, count: vets.length, data: vets });
  } catch (error) {
    next(error);
  }
};

// @desc  Get emergency vets
// @route GET /api/vets/emergency
const getEmergencyVets = async (req, res, next) => {
  try {
    const vets = await Vet.find({ isEmergency: true, isAvailable: true });
    res.json({ success: true, count: vets.length, data: vets });
  } catch (error) {
    next(error);
  }
};

// @desc  Create vet (admin)
// @route POST /api/vets
const createVet = async (req, res, next) => {
  try {
    const { lat, lng, ...rest } = req.body;
    const vetData = { ...rest };
    if (lat && lng) {
      vetData.location = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
    }
    const vet = await Vet.create(vetData);
    res.status(201).json({ success: true, data: vet });
  } catch (error) {
    next(error);
  }
};

// @desc  Update vet
// @route PUT /api/vets/:id
const updateVet = async (req, res, next) => {
  try {
    const { lat, lng, ...rest } = req.body;
    if (lat && lng) rest.location = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
    const vet = await Vet.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true });
    if (!vet) return res.status(404).json({ success: false, message: 'Vet not found.' });
    res.json({ success: true, data: vet });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete vet
// @route DELETE /api/vets/:id
const deleteVet = async (req, res, next) => {
  try {
    await Vet.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Vet deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllVets, getVetById, getNearbyVets, getEmergencyVets, createVet, updateVet, deleteVet };
