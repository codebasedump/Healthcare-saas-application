import express from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import tenantResolver from '../middleware/tenantResolver.js';
import * as logController from '../controllers/logController.js';

const router = express.Router();

router.get('/', protect, requireRole('admin'), tenantResolver, logController.getLogs);

router.get('/export', protect, requireRole('admin'), tenantResolver, logController.exportLogsCSV); // ✅ Add this line


export default router;