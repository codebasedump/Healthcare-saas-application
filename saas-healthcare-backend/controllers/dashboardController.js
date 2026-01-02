import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import AuditLog from '../models/Auditlog.js';
import mongoose from 'mongoose';

export const getDashboardMetrics = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
      console.error('❌ Invalid tenantId:', tenantId);
      return res.status(400).json({ error: 'Missing or invalid tenant context' });
    }

    const limit = parseInt(req.query.limit) || 4;
    const roleFilter = req.query.role || null;

    const [totalUsers, totalDoctors, totalAppointments, mfaEnabled] = await Promise.all([
      User.countDocuments({ tenantId }),
      User.countDocuments({ tenantId, role: 'doctor' }),
      Appointment.countDocuments({ tenantId }),
      User.countDocuments({ tenantId, mfaEnabled: true }),
    ]);

    const roleAggregation = await User.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const roleMap = { admin: 0, doctor: 0, receptionist: 0, patient: 0 };
    roleAggregation.forEach(role => {
      roleMap[role._id] = role.count;
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          tenantId: new mongoose.Types.ObjectId(tenantId),
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const recentLogs = await AuditLog.find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('message createdAt')
      .lean();

    const formattedLogs = recentLogs.map(log => ({
      timestamp: new Date(log.createdAt).toLocaleString(),
      message: log.message
    }));

    const topDoctors = await User.find({
      tenantId,
      role: 'doctor',
      ...(roleFilter && { specialty: roleFilter })
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email specialty')
      .lean();

    const mfaUsers = await User.find({
      tenantId,
      mfaEnabled: true,
      ...(roleFilter && { role: roleFilter })
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('name email role')
      .lean();

     await AuditLog.create({
        tenantId,
        userId: req.user._id,
        action: 'Viewed dashboard metrics',
        context: { previewLimit: limit, roleFilter },
        actor: req.user?.email || 'system' // ✅ required field
    });

    res.status(200).json({
      totalUsers,
      totalDoctors,
      totalAppointments,
      mfaEnabled,
      roleDistribution: [roleMap.admin, roleMap.doctor, roleMap.receptionist, roleMap.patient],
      appointmentStats,
      recentLogs: formattedLogs,
      topDoctors,
      mfaUsers
    });
  } catch (error) {
    console.error('📛 Dashboard metrics error:', error.stack || error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
};