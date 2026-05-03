const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAllVets, getVetById, getNearbyVets, getEmergencyVets, createVet, updateVet, deleteVet } = require('../controllers/vetController');

const router = express.Router();

router.get('/', getAllVets);
router.get('/nearby', getNearbyVets);
router.get('/emergency', getEmergencyVets);
router.get('/:id', getVetById);
router.post('/', protect, authorize('admin'), createVet);
router.put('/:id', protect, authorize('admin', 'veterinarian'), updateVet);
router.delete('/:id', protect, authorize('admin'), deleteVet);

module.exports = router;
