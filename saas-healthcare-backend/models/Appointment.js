import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'expired'],
    default: 'scheduled',
  },
  attended: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    enum: ['in-person', 'telehealth'],
    default: 'in-person',
  },
  notes: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  linkedAtBooking: { type: Boolean, default: false },
  cancellation: {
    reason: { type: String, default: '' },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: { type: Date },
  },
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  auditTrailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuditTrail',
  },
}, { timestamps: true });

AppointmentSchema.index({ tenantId: 1, doctorId: 1, date: 1 });
AppointmentSchema.index({ tenantId: 1, patientId: 1, date: 1 });

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
export default Appointment;