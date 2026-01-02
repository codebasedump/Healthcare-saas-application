import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phone: String,
  email: String,
  medicalHistory: [String],
  registeredDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastVisit: { type: Date },
  visitCount: { type: Number, default: 0 },
  notes: [{ date: Date, content: String }],
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Prevent OverwriteModelError in dev environments
const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
export default Patient;