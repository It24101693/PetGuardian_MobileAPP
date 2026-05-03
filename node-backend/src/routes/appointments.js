const express = require('express');
const { protect } = require('../middleware/auth');
const { getMyAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');

const router = express.Router();

router.use(protect);

router.get('/', getMyAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
