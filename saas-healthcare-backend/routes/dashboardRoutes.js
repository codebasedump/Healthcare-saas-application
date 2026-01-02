import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/metrics', protect, requireRole('admin'), dashboardController.getDashboardMetrics);

export default router;