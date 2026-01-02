import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AuditLog from '../models/Auditlog.js'; // adjust path if needed

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const seed = async () => {
  const tenantId = new mongoose.Types.ObjectId('68cd48e78d351c43fabbc4b2');
  const adminId = new mongoose.Types.ObjectId('68cd4e496200f750840f74a1');
  const doctorId = new mongoose.Types.ObjectId('68d0c34ff4a0916bc9a224fb');
  const patientId = new mongoose.Types.ObjectId('68cd4e496200f750840f74a2');
  const prescriptionId = new mongoose.Types.ObjectId('68cd55089b6dbfcd091802e1');
  const appointmentId = new mongoose.Types.ObjectId('68cd5454a5bf2782d5c35df0');

  const now = Date.now();

  const logs = [
    {
      userId: adminId,
      action: 'Created new patient record',
      entityType: 'Patient',
      entityId: patientId,
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 5),
      ipAddress: '192.168.1.10',
      actor: 'admin@hoffstee.com'
    },
    {
      userId: doctorId,
      action: 'Generated prescription',
      entityType: 'Prescription',
      entityId: prescriptionId,
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 4),
      ipAddress: '192.168.1.11',
      actor: 'dr.mohan@hoffstee.com'
    },
    {
      userId: doctorId,
      action: 'Viewed patient medical history',
      entityType: 'Patient',
      entityId: patientId,
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 3),
      ipAddress: '192.168.1.12',
      actor: 'dr.mohan@hoffstee.com'
    },
    {
      userId: adminId,
      action: 'Updated patient contact info',
      entityType: 'Patient',
      entityId: patientId,
      timestamp: new Date(now - 1000 * 60 * 60 * 24 * 2),
      ipAddress: '192.168.1.13',
      actor: 'admin@hoffstee.com'
    },
    {
      userId: doctorId,
      action: 'Updated prescription dosage',
      entityType: 'Prescription',
      entityId: prescriptionId,
      timestamp: new Date(now - 1000 * 60 * 60 * 24),
      ipAddress: '192.168.1.14',
      actor: 'dr.mohan@hoffstee.com'
    },
    {
      userId: adminId,
      action: 'Deleted appointment record',
      entityType: 'Appointment',
      entityId: appointmentId,
      timestamp: new Date(now - 1000 * 60 * 60 * 12),
      ipAddress: '192.168.1.15',
      actor: 'admin@hoffstee.com'
    },
    {
      userId: adminId,
      action: 'Created new doctor account',
      entityType: 'User',
      entityId: doctorId,
      timestamp: new Date(now - 1000 * 60 * 60 * 6),
      ipAddress: '192.168.1.16',
      actor: 'admin@hoffstee.com'
    },
    {
      userId: doctorId,
      action: 'Logged in',
      entityType: 'User',
      entityId: doctorId,
      timestamp: new Date(now - 1000 * 60 * 60 * 2),
      ipAddress: '192.168.1.17',
      actor: 'dr.mohan@hoffstee.com'
    },
    {
      userId: adminId,
      action: 'Exported prescription CSV',
      entityType: 'Prescription',
      entityId: null,
      timestamp: new Date(now - 1000 * 60 * 30),
      ipAddress: '192.168.1.18',
      actor: 'admin@hoffstee.com'
    },
    {
      userId: doctorId,
      action: 'Viewed appointment details',
      entityType: 'Appointment',
      entityId: appointmentId,
      timestamp: new Date(now - 1000 * 60 * 15),
      ipAddress: '192.168.1.19',
      actor: 'dr.mohan@hoffstee.com'
    },
    {
      userId: adminId,
      action: 'Reset doctor password',
      entityType: 'User',
      entityId: doctorId,
      timestamp: new Date(now - 1000 * 60 * 10),
      ipAddress: '192.168.1.20',
      actor: 'admin@hoffstee.com'
    },
    {
      userId: doctorId,
      action: 'Logged out',
      entityType: 'User',
      entityId: doctorId,
      timestamp: new Date(now - 1000 * 60 * 5),
      ipAddress: '192.168.1.21',
      actor: 'dr.mohan@hoffstee.com'
    },
    {
      userId: adminId,
      action: 'Viewed audit logs',
      entityType: 'AuditLog',
      entityId: null,
      timestamp: new Date(now - 1000 * 60 * 2),
      ipAddress: '192.168.1.22',
      actor: 'admin@hoffstee.com'
    },
    {
      userId: doctorId,
      action: 'Updated appointment status',
      entityType: 'Appointment',
      entityId: appointmentId,
      timestamp: new Date(now - 1000 * 60),
      ipAddress: '192.168.1.23',
      actor: 'dr.mohan@hoffstee.com'
    },
    {
      userId: adminId,
      action: 'Archived patient record',
      entityType: 'Patient',
      entityId: patientId,
      timestamp: new Date(),
      ipAddress: '192.168.1.24',
      actor: 'admin@hoffstee.com'
    }
  ];

  await AuditLog.insertMany(logs.map(log => ({ ...log, tenantId })));

  console.log('✅ Audit logs seeded');
  mongoose.disconnect();
};

seed();