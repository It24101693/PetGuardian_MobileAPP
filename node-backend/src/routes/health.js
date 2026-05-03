const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getPassportByPetId, updatePassport,
  addVaccination, updateVaccination, deleteVaccination,
  addMedicalRecord, updateMedicalRecord, deleteMedicalRecord,
  addAllergy,
} = require('../controllers/healthController');

const router = express.Router();

router.use(protect);

router.get('/pet/:petId', getPassportByPetId);
router.put('/:id', updatePassport);

router.post('/:passportId/vaccinations', addVaccination);
router.put('/vaccinations/:id', updateVaccination);
router.delete('/vaccinations/:id', deleteVaccination);

router.post('/:passportId/records', addMedicalRecord);
router.put('/records/:id', updateMedicalRecord);
router.delete('/records/:id', deleteMedicalRecord);

router.post('/:passportId/allergies', addAllergy);

module.exports = router;
