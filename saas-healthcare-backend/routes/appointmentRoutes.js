import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import tenantResolver from '../middleware/tenantResolver.js';
import * as appointmentController from '../controllers/appointmentController.js';

const router = express.Router();

// 🔐 Admin Routes
router.get('/', protect, requireRole('admin'), tenantResolver, appointmentController.getAllAppointments);

router.post(
  '/',
  protect,
  requireRole('admin'),
  tenantResolver,
  appointmentController.createAppointment
);

// router.put(
//   '/:id',
//   protect,
//   requireRole('admin'),
//   tenantResolver,
//   appointmentController.updateAppointment
// );

router.patch('/:id/attend',protect,
  requireRole('admin'),
  tenantResolver, appointmentController.markAppointmentAsAttended);

router.delete(
  '/:id',
  protect,
  requireRole('admin'),
  tenantResolver,
  appointmentController.deleteAppointment
);

// 🩺 Doctor-Specific Route
router.get(
  '/me',
  protect,
  requireRole('doctor'),
  tenantResolver,
  appointmentController.getAppointmentsForDoctor
);

router.post('/check-conflict', async (req, res) => {
  const { doctorId, date, timeSlot } = req.body;

  const conflict = await Appointment.findOne({
    doctorId,
    date,
    timeSlot,
    status: { $ne: 'cancelled' }
  });

  if (conflict) {
    return res.status(409).json({ error: 'Conflict detected' });
  }

  res.status(200).json({ ok: true });
});

router.get('/calendar', protect, requireRole('admin'), appointmentController.getCalendarAppointments);

router.get('/availability/date', protect, requireRole('admin'), appointmentController.getAvailabilityByDate);

router.post('/book', protect, requireRole('admin'), appointmentController.bookAppointment);

// router.patch('/appointments/:id', protect, requireRole('admin'), appointmentController.updateAppointment);

router.patch('/:id', protect, requireRole('admin'), appointmentController.updateAppointment);

router.post('/appointments/update-statuses',
  protect,
  requireRole('admin'),
  appointmentController.updateAppointmentStatuses
);

router.patch(
  '/:id/cancel',
  protect,
  requireRole('admin'),
  tenantResolver,
  appointmentController.cancelAppointment
);

export default router;