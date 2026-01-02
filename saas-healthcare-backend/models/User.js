import mongoose from 'mongoose';

const arrayLimit = (val) => Array.isArray(val) && val.length <= 10;

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['admin', 'doctor', 'receptionist', 'patient'],
    default: 'patient'
  },

  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },

  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  isActive: { type: Boolean, default: true },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String },
  mfaVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },

  department: { type: String },
  specialty: { type: String },
  clinicLocation: { type: String },
  certifications: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 10']
  },

  linkedPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],

  availability: [{
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    slots: [String]
  }],
  preferredMode: { type: String, enum: ['in-person', 'telehealth'], default: 'in-person' },

  auditTrail: [{
    action: String,
    timestamp: Date,
    actor: String
  }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// Compound index: email must be unique per tenant
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
export default User;