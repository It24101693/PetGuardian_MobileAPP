const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { uploadPetImage } = require('../config/cloudinary');
const {
  getAllPets, getPetsByOwner, getPetById, getPetByQrCode,
  createPet, updatePet, deletePet, getPublicPetProfile
} = require('../controllers/petController');

const router = express.Router();

// Public routes (no auth required)
router.get('/qr/:qrCode', getPetByQrCode);
router.get('/public/qr/:qrCode', getPublicPetProfile);

// Protected routes
router.use(protect);

router.get('/', getAllPets);
router.get('/owner/:ownerId', getPetsByOwner);
router.get('/:id', getPetById);
router.post('/', uploadPetImage.single('image'), createPet);
router.put('/:id', uploadPetImage.single('image'), updatePet);
router.delete('/:id', deletePet);

module.exports = router;
