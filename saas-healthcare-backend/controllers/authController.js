import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// 🔐 Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      tenantId: user.tenantId,
      status: user.status
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// 🚪 Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('linkedPatients');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // 🔐 MFA Enforcement
    if (user.mfaEnabled && !user.mfaVerified) {
      return res.json({
        mfaRequired: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          phone: user.phone,
          avatar: user.avatar
        }
      });
    }

    console.log(`🔑 Login attempt for: ${req.body.email}`);
    console.log(`📎 Returning MFA URI: ${user.mfaUri}`);

    // ✅ MFA passed or not enabled → return token
    const tokenPayload = {
      id: user._id,
      role: user.role,
      tenantId: user.tenantId,
      status: user.status
    };

    if (user.role === 'patient' && user.linkedPatients.length > 0) {
      tokenPayload.patientId = user.linkedPatients[0]._id;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        phone: user.phone,
        avatar: user.avatar,
        linkedPatient: user.linkedPatients[0] || null
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};

// 🚪 Logout
export const logout = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      user.mfaVerified = false;
      await user.save();
    }

    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
};