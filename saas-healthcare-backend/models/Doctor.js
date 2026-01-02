import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  name: String,
  email: String,
  phone: String,
  specialty: {
    type: String,
    enum: [
      'Cardiology',
      'Dermatology',
      'Neurology',
      'Psychiatry',
      'General Medicine',
      'Internal Medicine',
      'Other'
    ]
  },
  department: String,
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  licenseExpiry: Date,
  hospitalAffiliations: [String],
  certificateUrls: [String],
  linkedPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  role: {
    type: String,
    enum: ['doctor', 'nurse', 'admin'],
    required: true
  },
  isClinical: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
export default Doctor;