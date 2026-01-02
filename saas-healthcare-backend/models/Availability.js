import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  timeSlots: [String], // e.g. ['09:00 AM', '10:30 AM']
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

// ✅ Prevent OverwriteModelError in dev environments
const Availability = mongoose.models.Availability || mongoose.model('Availability', AvailabilitySchema);
export default Availability;