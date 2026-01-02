import Tenant from '../models/Tenant.js';

const tenantResolver = async (req, res, next) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID missing' });
  }

  try {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant || tenant.status !== 'active') {
      return res.status(403).json({ error: 'Tenant suspended or not found' });
    }

    req.tenant = tenant;
    req.tenantId = tenantId;

    next();
  } catch (err) {
    console.error('💥 tenantResolver error:', err);
    res.status(500).json({ error: 'Tenant resolution failed' });
  }
};

export default tenantResolver;