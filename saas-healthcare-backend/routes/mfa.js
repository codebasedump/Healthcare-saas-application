import express from 'express';
import QRCode from 'qrcode';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const OTPAuth = require('otpauth');

import User from '../models/User.js';
import { generateMfaSecret } from '../utils/generateMfaSecret.js';
import { generateToken } from '../controllers/authController.js';

const router = express.Router();

// 🔐 Setup MFA and return QR code
router.post('/setup-mfa', async (req, res) => {
  const { email } = req.body;
  const { secret, uri } = generateMfaSecret(email);

  await User.updateOne({ email }, { mfaSecret: secret, mfaEnabled: true });

  const qr = await QRCode.toDataURL(uri);
  res.json({ qr });
});

// 🔐 Verify OTP and issue JWT
router.post('/verify-otp', async (req, res) => {
  const { email, token } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.mfaSecret) {
    return res.status(400).json({ error: 'MFA not set up for this user' });
  }

  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(user.mfaSecret)
  });

  const delta = totp.validate({ token });

  if (delta === null) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  user.mfaVerified = true;
  await user.save();

  const jwt = generateToken(user);
  res.json({ token: jwt });
});

export default router;