const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async (tenantId, name, email, phone) => {
  const hashedPassword = await bcrypt.hash('Secure#123', 12);

  return await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: 'admin',
    tenantId,
    mfaEnabled: true,
    isActive: true,
    status: 'active',
    auditTrail: [{
      action: 'Admin created',
      actor: 'system',
      timestamp: new Date()
    }]
  });
};