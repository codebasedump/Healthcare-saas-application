import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import tenantResolver from '../middleware/tenantResolver.js';
import suspendedUserCheck from '../middleware/suspendedUserCheck.js';

const router = express.Router();

router.get('/', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.getUsers);
router.post('/', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.createUser);
router.get('/search', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.searchUsers);
router.get('/roles', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.getRoles);
router.get('/:id', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.getUserById);
router.put('/:id', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.updateUser);
router.delete('/:id', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.deleteUser);
router.put('/:id/mfa', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.toggleMFA);
router.get('/:id/audit', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.exportAuditTrail);
router.put('/:id/status', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.toggleUserStatus);
//router.get('/staff', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.getAllActiveStaff);

router.get('/staff', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.getAllActiveStaff);
//router.get('/staff', userController.getAllActiveStaff);

// router.get('/search', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.searchUsers);
// router.get('/mfa-users', protect, requireRole('admin'), tenantResolver, suspendedUserCheck, userController.getMfaUsers);

export default router;