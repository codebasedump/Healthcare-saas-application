// const mongoose = require('mongoose');

// const PrescriptionSchema = new mongoose.Schema({
//   tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
//   doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
//   appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
//   medications: [
//     {
//       name: String,
//       dosage: String,
//       frequency: String
//     }
//   ],
//   notes: String,
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Prescription', PrescriptionSchema);

import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true }
}, { _id: true });

const PrescriptionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ✅ fixed
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  medications: [MedicationSchema],
  notes: { type: String },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pdfUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('Prescription', PrescriptionSchema);
