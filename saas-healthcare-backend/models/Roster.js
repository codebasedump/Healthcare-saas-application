import mongoose from 'mongoose';

const RosterSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  shiftType: {
    type: String,
    enum: ['morning', 'evening', 'night', 'on-call']
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },
  notes: {
    type: String
  },
  tags: [String],
  timeSlots: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Index for tenant-scoped queries
RosterSchema.index({ tenantId: 1, staffId: 1, date: 1, startTime: 1 });

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
      current.setMinutes(current.getMinutes() + 30);
    }

    this.timeSlots = slots;
  }
  next();
});

const Roster = mongoose.model('Roster', RosterSchema);
export default Roster;