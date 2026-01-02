import Roster from '../models/Roster.js';
import Appointment from '../models/Appointment.js';
import mongoose from 'mongoose';

export const getRosterSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ error: 'Invalid doctor ID' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Missing date parameter' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const roster = await Roster.findOne({
      staffId: new mongoose.Types.ObjectId(doctorId),
      date: { $gte: startOfDay, $lt: endOfDay },
      status: 'active'
    });

    if (!roster) {
      return res.status(404).json({ message: 'No roster found for this doctor on selected date' });
    }

    const timeSlots = roster.timeSlots?.length
      ? roster.timeSlots
      : generateTimeSlots(roster.startTime, roster.endTime);

    const bookedAppointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    const bookedSlots = bookedAppointments.map(app => normalizeTime(app.timeSlot));
    const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot));

    res.status(200).json({ doctorId, date, availableSlots });
  } catch (error) {
    console.error('Roster slot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRoster = async (req, res) => {
  try {
    const timeSlots = generateTimeSlots(req.body.startTime, req.body.endTime);
    const roster = new Roster({ ...req.body, timeSlots });
    const saved = await roster.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllRosters = async (req, res) => {
  try {
    const rosters = await Roster.find()
      .populate({ path: 'staffId', select: 'name email role department specialty' })
      .sort({ date: -1 });

    res.json(rosters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bulkCreateRosters = async (req, res) => {
  try {
    const {
      staffId,
      role,
      department,
      date,
      startTime,
      endTime,
      shiftType,
      location,
      status,
      tags,
      notes,
      repeatDays = 14,
      tenantId,
      createdBy
    } = req.body;

    const startDate = new Date(date);
    const rosterEntries = [];

    for (let i = 0; i < repeatDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const timeSlots = generateTimeSlots(startTime, endTime);

      rosterEntries.push({
        staffId,
        role,
        department,
        date: currentDate,
        startTime,
        endTime,
        shiftType,
        location,
        status,
        tags,
        notes,
        timeSlots,
        tenantId,
        createdBy
      });
    }

    await Roster.insertMany(rosterEntries);
    res.status(201).json({ message: `${rosterEntries.length} rosters created` });
  } catch (err) {
    console.error('Bulk roster error:', err);
    res.status(400).json({ error: err.message });
  }
};

function generateTimeSlots(start, end) {
  const slots = [];
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  let current = new Date(0, 0, 0, startHour, startMin);
  const endTime = new Date(0, 0, 0, endHour, endMin);

  while (current < endTime) {
    const hours = current.getHours().toString().padStart(2, '0');
    const minutes = current.getMinutes().toString().padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
    current.setMinutes(current.getMinutes() + 30);
  }

  return slots;
}

function normalizeTime(timeStr) {
  // Converts formats like "10AM", "10.30AM", "10:30 AM" to "HH:mm"
  const time = new Date(`1970-01-01T${timeStr.replace('.', ':')}`);
  if (isNaN(time)) return timeStr; // fallback if parsing fails
  return time.toTimeString().slice(0, 5); // "HH:mm"
}