const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadScanImage } = require('../config/cloudinary');
const { getScansByPet, createScan, updateScan, deleteScan } = require('../controllers/scanController');

const router = express.Router();

router.use(protect);

router.get('/pet/:petId', getScansByPet);
router.post('/', uploadScanImage.single('image'), createScan);
router.put('/:id', updateScan);
router.delete('/:id', deleteScan);

module.exports = router;
