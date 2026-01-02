import express from 'express';
import { getAllRoles } from '../controllers/roleController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import tenantResolver from '../middleware/tenantResolver.js';
import suspendedUserCheck from '../middleware/suspendedUserCheck.js';

const router = express.Router();

// Apply middleware if needed (optional based on your access rules)
router.get(
  '/',
  protect,
  tenantResolver,
  suspendedUserCheck,
  getAllRoles
);

export default router;
