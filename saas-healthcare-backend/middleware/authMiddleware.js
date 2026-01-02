import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('🔐 Incoming token:', token);

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔓 Decoded token:', decoded);

    const user = await User.findById(decoded.id);
    console.log('👤 Fetched user:', user);

    if (!user || !user.tenantId) {
      return res.status(401).json({ error: 'Invalid user or missing tenantId' });
    }

    req.user = {
      ...user.toObject(),
      role: decoded.role,
      tenantId: decoded.tenantId,
      status: decoded.status,
      patientId: decoded.patientId || null
    };

    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles) => (req, res, next) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};