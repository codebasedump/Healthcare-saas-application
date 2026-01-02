import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import AuditLog from '../models/Auditlog.js';
import { generateMfaSecret } from '../utils/generateMfaSecret.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

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

  for (const tenant of tenants) {
    const adminEmail = `admin@${tenant.domain}`;
    const doctorEmail = `doctor@${tenant.domain}`;
    const receptionistEmail = `reception@${tenant.domain}`;

    const adminExists = await User.findOne({ email: adminEmail, tenantId: tenant._id });
    const doctorExists = await User.findOne({ email: doctorEmail, tenantId: tenant._id });
    const receptionistExists = await User.findOne({ email: receptionistEmail, tenantId: tenant._id });

    const adminId = adminExists?._id || new mongoose.Types.ObjectId();
    const usersToInsert = [];

    if (!adminExists) {
      const adminUser = {
        _id: adminId,
        name: `${tenant.name} Admin`,
        email: adminEmail,
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
        auditTrail: [{ action: 'Admin seeded', timestamp: new Date(), actor: 'system' }],
        linkedPatients: []
      };

      const { secret, uri } = generateMfaSecret(adminUser.email, tenant.name);
      adminUser.mfaSecret = secret;
      adminUser.mfaUri = uri;
      adminUser.auditTrail.push({ action: 'MFA secret seeded', timestamp: new Date(), actor: 'system' });

      usersToInsert.push(adminUser);
    }

    if (!receptionistExists) {
      usersToInsert.push({
        name: `Receptionist ${tenant.name}`,
        email: receptionistEmail,
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
        auditTrail: [{ action: 'Receptionist seeded', timestamp: new Date(), actor: 'system' }],
        linkedPatients: []
      });
    }

    if (!doctorExists) {
      const doctorUser = {
        name: `Dr. ${tenant.name.split(' ')[0]}`,
        email: doctorEmail,
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
        certifications: ['MBBS', 'MD', 'FRACGP'],
        createdBy: adminId,
        updatedAt: new Date(),
        auditTrail: [{ action: 'Doctor seeded', timestamp: new Date(), actor: 'system' }],
        linkedPatients: []
      };

      const { secret, uri } = generateMfaSecret(doctorUser.email, tenant.name);
      doctorUser.mfaSecret = secret;
      doctorUser.mfaUri = uri;
      doctorUser.auditTrail.push({ action: 'MFA secret seeded', timestamp: new Date(), actor: 'system' });

      usersToInsert.push(doctorUser);
    }

    for (const user of usersToInsert) {
      const created = await User.create(user);
      console.log(`✅ Inserted user: ${created.email}`);
    }

    const doctorUser = await User.findOne({ email: doctorEmail, tenantId: tenant._id });
    const doctorProfileExists = await Doctor.findOne({ userId: doctorUser._id });

    if (!doctorProfileExists) {
      await Doctor.create({
        userId: doctorUser._id,
        tenantId: doctorUser.tenantId,
        name: doctorUser.name,
        email: doctorUser.email,
        phone: doctorUser.phone,
        specialty: doctorUser.specialty,
        department: doctorUser.department,
        registrationNumber: `REG-${doctorUser.tenantId.toString().slice(-4)}`,
        licenseExpiry: new Date('2026-12-31'),
        hospitalAffiliations: [tenant.name],
        certificateUrls: doctorUser.certifications,
        linkedPatients: [],
        status: 'active',
        role: 'doctor',           // ✅ required for hydration
        isClinical: true,         // ✅ required for filtering
        createdBy: doctorUser.createdBy,
        createdAt: new Date()
      });

      await AuditLog.create({
        tenantId: doctorUser.tenantId,
        userId: doctorUser._id,
        action: 'Doctor profile seeded and synced',
        timestamp: new Date(),
        actor: 'Seed Script'
      });

      console.log(`✅ Synced doctor profile for ${doctorUser.name}`);
    }
  }

  console.log('🎉 Multi-tenant users and doctors seeded with MFA, certifications, and audit logs');
  await mongoose.disconnect();
};

await seed();