const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const { generateMfaSecret } = require('../utils/generateMfaSecret');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const tenants = [
  {
    _id: new mongoose.Types.ObjectId('68cd48e78d351c43fabbc4b2'),
    name: 'Hoffstee Medical',
    domain: 'hoffstee.com',
    phone: '0457 123 456'
  },
  {
    _id: new mongoose.Types.ObjectId('68d206669ac65723cc70335a'),
    name: 'Riverina Health',
    domain: 'riverina.com',
    phone: '0457 999 888'
  },
  {
    _id: new mongoose.Types.ObjectId('68d206669ac65723cc70335b'),
    name: 'Sunrise Hospital',
    domain: 'sunrisehospital.com',
    phone: '0457 888 777'
  }
];

const seed = async () => {
  const hashedPassword = await bcrypt.hash('Secure#123', 12);
  const users = [];

  for (const tenant of tenants) {
    const adminId = new mongoose.Types.ObjectId('68d21eea3fe8f06d73298cf6'); // ✅ Matches your token

    users.push(
      {
        _id: adminId,
        name: `${tenant.name} Admin`,
        email: `admin@${tenant.domain}`,
        phone: tenant.phone,
        password: hashedPassword,
        role: 'admin',
        tenantId: tenant._id,
        status: 'active',
        isActive: true,
        mfaEnabled: true,
        mfaVerified: false,
        lastLogin: new Date(),
        department: 'Administration',
        createdBy: null,
        updatedAt: new Date(),
        auditTrail: [
          { action: 'Admin seeded', timestamp: new Date(), actor: 'system' }
        ],
        linkedPatients: []
      },
      {
        name: `Receptionist ${tenant.name}`,
        email: `reception@${tenant.domain}`,
        phone: '0457 111 111',
        password: hashedPassword,
        role: 'receptionist',
        tenantId: tenant._id,
        status: 'active',
        isActive: true,
        mfaEnabled: false,
        lastLogin: new Date(),
        department: 'Front Desk',
        createdBy: adminId,
        updatedAt: new Date(),
        auditTrail: [
          { action: 'Receptionist seeded', timestamp: new Date(), actor: 'system' }
        ],
        linkedPatients: []
      },
      {
        name: `Dr. ${tenant.name.split(' ')[0]}`,
        email: `doctor@${tenant.domain}`,
        phone: '0457 222 222',
        password: hashedPassword,
        role: 'doctor',
        tenantId: tenant._id,
        status: 'active',
        isActive: true,
        mfaEnabled: true,
        mfaVerified: false,
        lastLogin: new Date(),
        department: 'General Medicine',
        specialty: 'Internal Medicine',
        certifications: ['MBBS', 'MD', 'FRACGP'], // ✅ Added certifications
        createdBy: adminId,
        updatedAt: new Date(),
        auditTrail: [
          { action: 'Doctor seeded', timestamp: new Date(), actor: 'system' }
        ],
        linkedPatients: []
      }
    );
  }

  for (const user of users) {
    if (user.mfaEnabled) {
      const tenant = tenants.find(t => t._id.toString() === user.tenantId.toString());
      const { secret, uri } = generateMfaSecret(user.email, tenant.name);
      user.mfaSecret = secret;
      user.mfaUri = uri;
      user.mfaVerified = false;

      user.auditTrail.push({
        action: 'MFA secret seeded',
        timestamp: new Date(),
        actor: 'system'
      });
    }
  }

  await User.insertMany(users);
  console.log('✅ Multi-tenant users seeded with MFA secrets and certifications');
  mongoose.disconnect();
};

seed();