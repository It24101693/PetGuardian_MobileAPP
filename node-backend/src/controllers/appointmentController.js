const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc  Get appointments for current user
// @route GET /api/appointments
const getMyAppointments = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'owner') filter.ownerId = req.user._id;
    else if (req.user.role === 'veterinarian') filter.vetUserId = req.user._id;
    // admin sees all
    const appointments = await Appointment.find(filter)
      .populate('petId', 'name species imageUrl')
      .populate('ownerId', 'fullName phoneNumber email')
      .populate('vetId', 'name clinicName phone')
      .sort({ appointmentDate: 1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single appointment
// @route GET /api/appointments/:id
const getAppointmentById = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('petId', 'name species breed imageUrl')
      .populate('ownerId', 'fullName phoneNumber email')
      .populate('vetId', 'name clinicName phone specialization');
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, data: appt });
  } catch (error) {
    next(error);
  }
};

// @desc  Create appointment
// @route POST /api/appointments
const createAppointment = async (req, res, next) => {
  try {
    const appointmentDate = new Date(req.body.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({ success: false, message: 'Appointment date must be in the future.' });
    }

    const appointment = await Appointment.create({ ...req.body, ownerId: req.user._id });
    
    // Notify the Vet (if exists)
    if (appointment.vetUserId) {
      await createNotification(
        appointment.vetUserId,
        'New Appointment Request',
        `You have a new appointment request for ${req.body.petName || 'a pet'}.`,
        'appointment',
        'medium',
        appointment._id
      );
    }

    // Also notify all Admins
    try {
      const admins = await User.find({ role: 'admin' });
      console.log(`Notifying ${admins.length} admins about new appointment`);
      for (const admin of admins) {
        await createNotification(
          admin._id,
          'Admin Alert: New Booking',
          `A new appointment has been requested for ${req.body.petName || 'a pet'} at ${appointment.appointmentTime}.`,
          'alert',
          'medium',
          appointment._id
        );
      }
    } catch (err) {
      console.error('Failed to notify admins:', err);
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc  Update appointment
// @route PUT /api/appointments/:id
const updateAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    
    if (appt.ownerId.toString() !== req.user._id.toString() && req.user.role === 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Notify the Owner if status changed
    if (req.body.status && req.body.status !== appt.status) {
      await createNotification(
        appt.ownerId,
        'Appointment Status Updated',
        `Your appointment status has been updated to ${req.body.status}.`,
        'appointment',
        'high',
        appt._id
      );
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete appointment
// @route DELETE /api/appointments/:id
const deleteAppointment = async (req, res, next) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment };
