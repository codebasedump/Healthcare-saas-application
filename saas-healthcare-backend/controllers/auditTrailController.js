import AuditLog from '../models/Auditlog.js';

export const getAuditTrail = async (req, res) => {
  try {
    const {
      userId,
      search = '',
      from,
      to,
      page = 1,
      limit = 10
    } = req.query;

    const tenantId = req.user.tenantId;
    const query = { tenantId };

    if (userId) query.userId = userId;

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { actor: { $regex: search, $options: 'i' } }
      ];
    }

    if (from && to) {
      query.timestamp = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    res.json({ logs, total });
  } catch (err) {
    console.error('Audit trail error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
