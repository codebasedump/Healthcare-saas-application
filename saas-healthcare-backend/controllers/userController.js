import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { syncDoctorProfile } from '../helpers/syncDoctor.js';

// GET all users for tenant
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.user.tenantId });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// POST create user
export const createUser = async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    status,
    department,
    specialty,
    mfaEnabled
  } = req.body;

  // ✅ Backend validation
  if (!name || !email || !password || !role || !department) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (role === 'doctor' && !specialty) {
    return res.status(400).json({ error: 'Specialty is required for doctors' });
  }

  if (!['admin', 'doctor', 'receptionist', 'patient'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new User({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
    status,
    department,
    specialty: role === 'doctor' ? specialty : undefined,
    mfaEnabled,
    tenantId: req.user.tenantId,
    createdBy: req.user._id
  });

  await newUser.save();

  return res.status(201).json({ success: true, user: newUser });
};



// GET single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isAdmin = req.user.role === 'admin';
    const filtered = {
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      department: user.department,
      specialty: user.specialty,
      lastLogin: user.lastLogin,
      ...(isAdmin && {
        mfaEnabled: user.mfaEnabled,
        auditTrail: user.auditTrail.slice(-5)
      })
    };
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// PUT update user
export const updateUser = async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      {
        ...req.body,
        updatedAt: new Date(),
        updatedBy: req.user._id,
        $push: {
          auditTrail: {
            action: 'User updated',
            timestamp: new Date(),
            actor: req.user.name
          }
        }
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update user' });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Toggle MFA
export const toggleMFA = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.mfaEnabled = !user.mfaEnabled;
    user.auditTrail.push({
      action: `MFA ${user.mfaEnabled ? 'enabled' : 'disabled'}`,
      timestamp: new Date(),
      actor: req.user.name
    });

    await user.save();
    res.json({ mfaEnabled: user.mfaEnabled });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle MFA' });
  }
};

// Export audit trail
export const exportAuditTrail = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const logs = user.auditTrail.map(log => ({
      action: log.action,
      actor: log.actor,
      timestamp: log.timestamp.toISOString()
    }));

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export audit trail' });
  }
};

// Toggle user status
export const toggleUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const isActive = status === 'active';

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      {
        status,
        isActive,
        updatedAt: new Date(),
        $push: {
          auditTrail: {
            action: `User ${isActive ? 'activated' : 'deactivated'}`,
            actor: req.user.name,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    console.error('User status toggle failed:', err);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
};


export const searchUsers = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
      console.error('❌ Invalid tenantId:', tenantId);
      return res.status(400).json({ error: 'Missing or invalid tenant context' });
    }

    const {
      query = '',
      role = 'all',
      page = 1,
      limit = 10
    } = req.query;

    const trimmedQuery = query.trim();
    const normalizedRole = role.toLowerCase();
    const currentPage = Math.max(1, parseInt(page));
    const itemsPerPage = Math.max(1, parseInt(limit));
    const skip = (currentPage - 1) * itemsPerPage;

    const filter = { tenantId };

    // Role filter
    if (normalizedRole !== 'all') {
      if (typeof normalizedRole !== 'string') {
        console.error('❌ Invalid role type:', role);
        return res.status(400).json({ error: 'Invalid role parameter' });
      }
      filter.role = normalizedRole;
    }

    // Search filter
    if (trimmedQuery.length > 0) {
      try {
        const regex = new RegExp(trimmedQuery, 'i');
        filter.$or = [
          { name: { $regex: regex } },
          { email: { $regex: regex } },
          { role: { $regex: regex } }
        ];
      } catch (regexErr) {
        console.error('❌ Regex construction failed:', regexErr);
        return res.status(400).json({ error: 'Invalid search query' });
      }
    }

    console.log('🧠 Final MongoDB filter:', JSON.stringify(filter, null, 2));

    // Count total users
    let totalUsers = 0;
    try {
      totalUsers = await User.countDocuments(filter);
    } catch (countErr) {
      console.error('❌ countDocuments failed:', countErr);
      return res.status(500).json({ error: 'Failed to count users' });
    }

    // Fetch paginated users
    let users = [];
    try {
      users = await User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage)
        .lean();
    } catch (queryErr) {
      console.error('❌ MongoDB query failed:', queryErr);
      return res.status(500).json({ error: 'Failed to query users' });
    }

    console.log(`✅ Fetched ${users.length} users`);

    // Sanitize output
    const sanitizedUsers = users.map(user => ({
      _id: user._id?.toString(),
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      status: user.status || '',
      isActive: !!user.isActive,
      mfaEnabled: !!user.mfaEnabled,
      department: user.department || '',
      specialty: user.specialty || '',
      lastLogin: user.lastLogin instanceof Date ? user.lastLogin : null,
      createdAt: user.createdAt instanceof Date ? user.createdAt : null,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt : null
    }));

    return res.status(200).json({
      success: true,
      users: sanitizedUsers,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / itemsPerPage)
      }
    });

  } catch (err) {
    console.error('❌ Unexpected controller error:', err.stack || err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const getRoles = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant context' });
    }

    const roles = await User.distinct('role', { tenantId });

    const sortedRoles = roles
      .filter(role => typeof role === 'string')
      .map(role => role.trim().toLowerCase())
      .sort();

    return res.status(200).json({ success: true, roles: sortedRoles });
  } catch (err) {
    console.error('❌ Failed to fetch roles from users:', err);
    return res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

// export const getAllActiveStaff = async (req, res) => {
//   try {
//     console.log('🔍 getAllActiveStaff triggered');

//     const staff = await User.find({ isActive: true, status: 'active' })
//       .select('_id name role department specialty email');

//     console.log('✅ Staff found:', staff);
//     res.json(staff);
//   } catch (err) {
//     console.error('❌ getAllActiveStaff error:', err.message);
//     console.error(err.stack); // This will show the exact line and cause
//     res.status(500).json({ error: 'Failed to fetch staff list' });
//   }
// };

export const getAllActiveStaff = async (req, res) => {
  try {
    console.log('🔍 getAllActiveStaff triggered');
    const staff = await User.find().limit(5);
    console.log('✅ Staff found:', staff);
    res.json(staff);
  } catch (err) {
    console.error('❌ getAllActiveStaff error:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: 'Failed to fetch staff list' });
  }
};

// export const getMfaUsers = async (req, res) => {
//   try {
//     const users = await User.find({ mfaEnabled: true }).select('name role email');
//     res.status(200).json({ users });
//   } catch (err) {
//     console.error('Failed to fetch MFA users:', err);
//     res.status(500).json({ error: 'Failed to fetch user' });
//   }
// };


