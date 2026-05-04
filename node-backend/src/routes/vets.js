const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAllVets, getVetById, getNearbyVets, getEmergencyVets, createVet, updateVet, deleteVet } = require('../controllers/vetController');

const router = express.Router();

const { body, validationResult } = require('express-validator');

const validateVet = [
  body('name').notEmpty().withMessage('Doctor name is required'),
  body('clinicName').notEmpty().withMessage('Clinic name is required'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

router.get('/', getAllVets);
router.get('/nearby', getNearbyVets);
router.get('/emergency', getEmergencyVets);
router.get('/:id', getVetById);
router.post('/', protect, authorize('admin'), validateVet, createVet);
router.put('/:id', protect, authorize('admin', 'veterinarian'), validateVet, updateVet);
router.delete('/:id', protect, authorize('admin'), deleteVet);

module.exports = router;
