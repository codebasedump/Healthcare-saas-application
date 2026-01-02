import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import {
  getRosterSlots,
  createRoster,
  getAllRosters
} from '../controllers/rosterController.js';

const router = express.Router();
router.get('/', protect, requireRole('admin'), getAllRosters);

router.get('/doctors/:doctorId/roster-slots', protect, requireRole('admin'), getRosterSlots);

router.post('/roster', protect, requireRole('admin'), createRoster);

export default router;