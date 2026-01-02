import express from 'express';
import tenantResolver from '../middleware/tenantResolver.js';
import suspendedUserCheck from '../middleware/suspendedUserCheck.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import * as patientController from '../controllers/patientController.js';

const router = express.Router();

// 🛡 Admin: Get all patients
router.get(
  '/',
  protect,
  requireRole('admin'),
  tenantResolver,
  suspendedUserCheck,
  patientController.getAllPatients
);

// 🧬 Admin: Get linked patients for a specific patient
router.get(
  '/:id/linked-patients',
  protect,
  requireRole('admin'),
  patientController.getLinkedPatients
);

router.get(
  '/:id/linked-patients',
  protect,
  requireRole('admin'),
  patientController.getLinkedViewPatients
);

// 🔗 Admin: Link patients together
router.put(
  '/:id/link-patients',
  protect,
  requireRole('admin'),
  patientController.linkPatients
);

router.put('/:doctorId/unlink-patient/:patientId', protect, requireRole('admin'), patientController.unlinkPatientFromDoctor);

router.get('/:id/unlinked-patients', protect, requireRole('admin'), patientController.getUnlinkedPatients);

router.post('/reassign-patient', protect, requireRole('admin'), tenantResolver, patientController.reassignPatientToDoctor);

export default router;  