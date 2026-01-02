import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import tenantResolver from '../middleware/tenantResolver.js';
import * as doctorController from '../controllers/doctorController.js';

const router = express.Router();

// 🛡 Admin: Get all doctors
router.get('/', protect, requireRole('admin'), tenantResolver, doctorController.getAllDoctors);

router.get('/clinical', protect, requireRole('admin'), tenantResolver, doctorController.getDoctorsFromCollection);

router.get('/clinical/doctors', protect, tenantResolver, doctorController.getDoctorsFromCollection);

router.post('/create', protect, requireRole('admin'), tenantResolver, doctorController.createDoctorUserAndProfile);

// 🛡 Admin: Update doctor profile
router.put('/:id', protect, requireRole('admin'), tenantResolver, doctorController.updateDoctorProfile);

// 🛡 Admin: Toggle doctor active/inactive
router.patch('/:id/status', protect, requireRole('admin'), tenantResolver, doctorController.updateDoctorStatus);

// 🛡 Admin: Reset MFA for doctor
router.post('/:id/reset-mfa', protect, requireRole('admin'), tenantResolver, doctorController.resetDoctorMFA);

// 🛡 Admin: toggle-mfa for doctor
router.post('/:id/toggle-mfa', protect, requireRole('admin'), tenantResolver, doctorController.toggleDoctorMFA);

// 🛡 Admin: Get audit logs for doctor2360
router.get('/:id/logs', protect, requireRole('admin'), tenantResolver, doctorController.getDoctorLogs);

// 🛡 Admin: Get doctor stats (appointments, patients)
router.get('/:id/stats', protect, requireRole('admin'), tenantResolver, doctorController.getDoctorStats);

// 🩺 Doctor: Get own profile
router.get('/me', protect, requireRole('doctor'), tenantResolver, doctorController.getDoctorProfile);

// 🩺 Doctor: Get linked patients
router.get('/me/patients', protect, requireRole('doctor'), tenantResolver, doctorController.getLinkedPatients);

// 🩺 Doctor: Availability and reviews
router.get('/availability', protect, tenantResolver, doctorController.getAvailability);

router.get('/reviews/summary', protect, tenantResolver, doctorController.getReviewSummary);

router.get('/specialties', protect, requireRole(['admin', 'doctor']), tenantResolver, doctorController.getSpecialties);

router.get('/paginated', protect, requireRole('admin'), tenantResolver, doctorController.getPaginatedDoctors);


export default router;