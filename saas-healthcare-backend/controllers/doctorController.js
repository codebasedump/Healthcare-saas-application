import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import AuditLog from '../models/Auditlog.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Availability from '../models/Availability.js';
import Review from '../models/Review.js';
import Doctor from '../models/Doctor.js';

// 🛡 Admin: Get all doctors in tenant
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: 'doctor',
      tenantId: req.user.tenantId
    }).select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};


// getDoctorsFromCollection
export const getDoctorsFromCollection = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenantId' });
    }

    const doctors = await Doctor.find({
      tenantId,
      status: 'active',
      role: 'doctor',
      isClinical: true
    }).select(
      'name email phone specialty department registrationNumber licenseExpiry hospitalAffiliations certificateUrls'
    );

    console.log(`📦 Found ${doctors.length} doctors for tenant ${tenantId}`);
    res.json(doctors);
  } catch (err) {
    console.error('❌ Failed to fetch doctors:', err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};


// createDoctorUserAndProfile
export const createDoctorUserAndProfile = async (req, res) => {
  try {
    const {
      email, password, name, phone,
      department, specialty, registrationNumber,
      certificateUrls, licenseExpiry, hospitalAffiliations
    } = req.body;

    const tenantId = req.user.tenantId;

    const existing = await User.findOne({ email, tenantId });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists for this tenant' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'doctor',
      status: 'active',
      department,
      specialty,
      registrationNumber,
      tenantId,
      createdBy: req.user._id,
      mfaEnabled: false,
      lastLogin: null,
      certifications: certificateUrls || [],
      auditTrail: [{
        action: 'Doctor user created',
        timestamp: new Date(),
        actor: req.user.name
      }]
    });

    await user.save();

    const doctor = await Doctor.create({
      userId: user._id,
      tenantId,
      name,
      email,
      phone,
      specialty,
      department,
      registrationNumber,
      certificateUrls: certificateUrls || [],
      licenseExpiry,
      hospitalAffiliations,
      createdBy: req.user._id
    });

    await AuditLog.create({
      tenantId,
      userId: user._id,
      action: 'Doctor profile synced to doctors collection',
      timestamp: new Date(),
      actor: req.user?.name || 'system' // ✅ fallback prevents crash
    });


    res.status(201).json({ user, doctor });
  } catch (err) {
    console.error('❌ Doctor creation failed:', err);
    res.status(500).json({ error: 'Failed to create doctor user and profile' });
  }
};

// updateDoctorProfile
export const updateDoctorProfile = async (req, res) => {
  try {
    const updates = req.body;
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    res.json(doctor);
  } catch (err) {
    console.error('Update failed:', err);
    res.status(500).json({ error: 'Failed to update doctor profile' });
  }
};

// updateDoctorStatus
export const updateDoctorStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const status = isActive ? 'active' : 'suspended';

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive,
        status,
        updatedAt: new Date(),
        $push: {
          auditTrail: {
            action: `Status changed to ${status}`,
            timestamp: new Date(),
            actor: 'Admin Panel'
          }
        }
      },
      { new: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    console.error('Doctor status update failed:', err);
    res.status(500).json({ error: 'Failed to update doctor status' });
  }
};

// getDoctorProfile (doctor self-view)
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id).select('-password');
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// getLinkedPatients
export const getLinkedPatients = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id).populate('linkedPatients');
    res.json(doctor.linkedPatients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch linked patients' });
  }
};

// getDoctorLogs
export const getDoctorLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }

    const doctorObjectId = new mongoose.Types.ObjectId(id);
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

    const logs = await AuditLog.find({
      tenantId: tenantObjectId,
      userId: doctorObjectId
    })
    .sort({ timestamp: -1 })
    .limit(50);

    res.json({ success: true, data: logs });
  } catch (err) {
    console.error('❌ Error fetching doctor logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// resetDoctorMFA
export const resetDoctorMFA = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      mfaEnabled: true,
      mfaVerified: false,
      mfaSecret: null
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset MFA' });
  }
};


export const toggleDoctorMFA = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.mfaEnabled = !user.mfaEnabled;
    user.mfaVerified = false;
    user.mfaSecret = null;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error toggling MFA:', err);
    res.status(500).json({ success: false, error: 'Failed to toggle MFA' });
  }
};

// export const resetDoctorMFA = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, error: 'Invalid doctor ID' });
//     }

//     // Perform update
//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       {
//         mfaEnabled: false,
//         mfaVerified: false,
//         mfaSecret: null
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, error: 'Doctor not found' });
//     }

//     console.log(`🔐 MFA reset for doctor: ${updatedUser.name} (${updatedUser._id})`);
//     res.json({ success: true, data: updatedUser });
//   } catch (err) {
//     console.error('❌ Error resetting MFA:', err.message);
//     res.status(500).json({ success: false, error: 'Failed to reset MFA' });
//   }
// };

// getDoctorStats
export const getDoctorStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ error: 'Invalid doctor or tenant ID' });
    }

    const doctorObjectId = new mongoose.Types.ObjectId(id);
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

    const [linkedPatients, appointments, doctor] = await Promise.all([
      Patient.countDocuments({ doctorId: doctorObjectId, tenantId: tenantObjectId }),
      Appointment.countDocuments({ doctorId: doctorObjectId, tenantId: tenantObjectId }),
      User.findById(doctorObjectId).select('lastLogin')
    ]);

    const lastLogin = doctor?.lastLogin || null;

    res.json({
      success: true,
      data: {
        linkedPatients,
        appointments,
        lastLogin
      }
    });
  } catch (err) {
    console.error('❌ Error fetching doctor stats:', err);
    res.status(500).json({ error: 'Failed to fetch doctor stats' });
  }
};

// getDoctorProfile (public view)
export const getDoctorPublicProfile = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const availability = await Availability.find({ doctorId });
    const ratingSummary = await Review.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: '$doctorId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json({
      availability,
      rating: ratingSummary[0] || { avgRating: 0, count: 0 }
    });
  } catch (err) {
    console.error('❌ Failed to load doctor profile:', err);
    res.status(500).json({ error: 'Failed to load doctor profile' });
  }
};

// getAvailability
export const getAvailability = async (req, res) => {
  try {
    const { doctorId, dayOfWeek } = req.query;
    const slots = await Availability.find({ doctorId, dayOfWeek });
    res.json(slots);
  } catch (err) {
    console.error('❌ Availability error:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

// ⭐ Get doctor rating summary
export const getReviewSummary = async (req, res) => {
  try {
    const { doctorId } = req.query;

    const summary = await Review.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: '$doctorId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(summary[0] || { avgRating: 0, count: 0 });
  } catch (err) {
    console.error('❌ Review summary error:', err);
    res.status(500).json({ error: 'Failed to fetch review summary' });
  }
};

export const getSpecialties = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId || !mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ error: 'Invalid tenant context' });
    }

    const specialties = await User.distinct('specialty', {
      tenantId,
      role: 'doctor',
      specialty: { $exists: true, $ne: '' }
    });

    res.status(200).json({ specialties });
  } catch (error) {
    console.error('📛 Failed to fetch specialties:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ⭐ Paginated + Filtered Doctors for Admin
export const getPaginatedDoctors = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    console.log('Tenant ID:', tenantId);
    console.log('Query Params:', req.query);

    const {
      page = 1,
      pageSize = 10,
      search = '',
      specialty = 'all',
      status = 'all'
    } = req.query;

    const query = {
      tenantId,
      role: 'doctor'
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialty !== 'all') query.specialty = specialty;
    if (status !== 'all') query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [doctors, total] = await Promise.all([
      User.find(query).select('-password').skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        data: doctors,
        total: doctors.length
      }
    });

  } catch (err) {
    console.error('❌ Failed to fetch paginated doctors:', err);
    res.status(500).json({ error: 'Server error' });
  }
};