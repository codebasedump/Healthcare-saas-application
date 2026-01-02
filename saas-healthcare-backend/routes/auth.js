import express from 'express';
import { login, logout } from '../controllers/authController.js';

const router = express.Router();

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', logout);

export default router;