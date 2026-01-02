import Doctor from '../models/Doctor.js';
import AuditLog from '../models/Auditlog.js';

export const syncDoctorProfile = async (user) => {
  if (user.role !== 'doctor') return;

  const exists = await Doctor.findOne({ userId: user._id });
  if (exists) return;

  await Doctor.create({
    userId: user._id,
    tenantId: user.tenantId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    specialty: user.specialty,
    department: user.department,
    registrationNumber: user.registrationNumber,
    certificateUrls: user.certifications || [],
    createdBy: user.createdBy || null
  });

  await AuditLog.create({
    tenantId: user.tenantId,
    userId: user._id,
    action: 'Doctor profile synced to doctors collection',
    timestamp: new Date(),
    actor: 'System Sync'
  });

  console.log(`🔄 Synced doctor profile for ${user.name}`);
};