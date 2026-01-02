import express from 'express';
import tenantResolver from '../middleware/tenantResolver.js';
import suspendedUserCheck from '../middleware/suspendedUserCheck.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import {
  getAllPrescriptions,
  createPrescription,
  updatePrescription,
  searchPrescriptions,
  exportPrescriptions,
  getPrescriptionsForPatient,
  deletePrescription
} from '../controllers/prescriptionController.js';

const router = express.Router();

router.get('/', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, getAllPrescriptions);
router.post('/', protect, requireRole('doctor'), tenantResolver, suspendedUserCheck, createPrescription);
router.patch('/:id', protect, requireRole(['admin', 'doctor']), tenantResolver, suspendedUserCheck, updatePrescription);
router.get('/search', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, searchPrescriptions);
router.get('/export', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, exportPrescriptions);
router.get('/my', protect, requireRole('patient'), tenantResolver, getPrescriptionsForPatient);
router.delete('/:id', protect, requireRole(['admin', 'doctor']), tenantResolver, suspendedUserCheck, deletePrescription);

export default router;