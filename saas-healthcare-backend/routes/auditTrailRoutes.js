import express from 'express';
import tenantResolver from '../middleware/tenantResolver.js';
import suspendedUserCheck from '../middleware/suspendedUserCheck.js';
import { getAuditTrail } from '../controllers/auditTrailController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/audit-trail', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, getAuditTrail);

export default router;