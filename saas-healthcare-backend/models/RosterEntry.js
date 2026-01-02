import mongoose from 'mongoose';

const RosterSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // "08:00"
  endTime: { type: String, required: true },   // "16:00"
  shiftType: { type: String, enum: ['morning', 'evening', 'night', 'on-call'] },
  location: { type: String },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  notes: { type: String },
  tags: [String],
  timeSlots: [{ type: String }], // ✅ Auto-generated slots like ["08:00", "08:30", "09:00"]
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Index for efficient queries
RosterSchema.index({ staffId: 1, date: 1, startTime: 1 });

/**
 * Auto-generate timeSlots before saving
 * Generates 30-minute intervals between startTime and endTime
 */
RosterSchema.pre('save', function (next) {
  if (!this.timeSlots || this.timeSlots.length === 0) {
    const slots = [];
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);

    let current = new Date(0, 0, 0, startHour, startMin);
    const end = new Date(0, 0, 0, endHour, endMin);

    while (current < end) {
      const hours = current.getHours().toString().padStart(2, '0');
      const minutes = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
      current.setMinutes(current.getMinutes() + 30); // 30-minute intervals
    }

    this.timeSlots = slots;
  }
  next();
});

const Roster = mongoose.model('Roster', RosterSchema);
export default Roster;