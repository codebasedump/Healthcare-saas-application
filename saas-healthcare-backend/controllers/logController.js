// controllers/auditController.js
import AuditLog from '../models/Auditlog.js';
import User from '../models/User.js';
import { Parser } from 'json2csv';

export const getLogs = async (req, res) => {
  const { tenantId } = req.user;
  const { user, action, startDate, endDate, page = 1, limit = 50 } = req.query;

  if (!tenantId) return res.status(400).json({ error: 'Tenant ID missing' });

  const query = { tenantId };

  try {
    // 🔍 Resolve user name to ObjectId
    if (user) {
      const matchedUser = await User.findOne({
        name: new RegExp(user, 'i'),
        tenantId: tenantId
      }).select('_id');

      if (matchedUser) {
        query.userId = matchedUser._id;
      } else {
        // No match — return empty result early
        return res.json([]);
      }
    }

    if (action) query.action = new RegExp(action, 'i');

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name email');

    const total = await AuditLog.countDocuments(query);

    res.json({ logs, total });

  } catch (err) {
    console.error('❌ Error fetching logs:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};


export const exportLogsCSV = async (req, res) => {
  try {
    const logs = await AuditLog.find({ tenantId: req.user.tenantId }).populate('userId', 'name email');

    const parser = new Parser();
    const csv = parser.parse(logs.map(log => ({
      timestamp: log.timestamp,
      action: log.action,
      user: log.userId?.name || 'Unknown',
      email: log.userId?.email || '',
      ipAddress: log.ipAddress || '',
    })));

    res.header('Content-Type', 'text/csv');
    res.attachment('audit_logs.csv');
    res.send(csv);
  } catch (err) {
    console.error('❌ Error exporting logs:', err);
    res.status(500).json({ error: 'Failed to export logs' });
  }
};
