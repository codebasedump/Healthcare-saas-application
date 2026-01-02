import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Availability from '../models/Availability.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';

export const getAllAppointments = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId?.toString();
    if (!tenantId) {
      console.warn("Missing tenantId in request user");
      return res.status(400).json({ error: "Tenant ID missing" });
    }

    const appointments = await Appointment.find({ tenantId })
      .populate('doctorId')
      .populate('patientId')
      .sort({ date: 1 })
      .lean();

    console.log('✅ Returning appointments:', appointments.length);
    res.json(appointments);
  } catch (err) {
    console.error('❌ Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};


// Doctor: Get appointments for logged-in doctor (only linked patients)
export const getAppointmentsForDoctor = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id).lean();
    if (!doctor || doctor.role !== 'doctor' || doctor.tenantId !== req.user.tenantId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!doctor.linkedPatients || doctor.linkedPatients.length === 0) {
      return res.status(200).json([]);
    }

    const appointments = await Appointment.find({
      doctorId: req.user._id,
      patientId: { $in: doctor.linkedPatients },
      tenantId: req.user.tenantId
    })
      .populate({
        path: 'patientId',
        model: 'Patient',
        match: { tenantId: req.user.tenantId },
        select: 'name email dob gender phone tenantId'
      })
      .sort({ date: 1 });

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching doctor appointments:', err);
    res.status(500).json({ error: 'Failed to fetch doctor appointments' });
  }
};

// Create appointment (with linkage and tenant validation)
export const createAppointment = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.body.doctorId, role: 'doctor', tenantId: req.user.tenantId });
    if (!doctor) {
      return res.status(400).json({ error: 'Invalid doctorId or tenant mismatch' });
    }

    const patient = await Patient.findOne({ _id: req.body.patientId, tenantId: req.user.tenantId });
    if (!patient) {
      return res.status(400).json({ error: 'Invalid patientId or tenant mismatch' });
    }

    const isLinked = doctor.linkedPatients?.some(id => id.toString() === req.body.patientId);
    if (!isLinked) {
      return res.status(403).json({ error: 'Patient not linked to doctor' });
    }

    const newAppointment = new Appointment({
      ...req.body,
      tenantId: req.user.tenantId,
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

// PATCH /appointments/:id
export const updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { date, timeSlot, ...rest } = req.body;

    if (!date || !timeSlot) {
      return res.status(400).json({ error: 'Date and timeSlot are required.' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }

    if (!/^\d{2}:\d{2}$/.test(timeSlot)) {
      return res.status(400).json({ error: 'Invalid timeSlot format. Expected HH:mm.' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    appointment.date = parsedDate;
    appointment.timeSlot = timeSlot;
    appointment.status = 'rescheduled';
    appointment.attended = false; // ✅ reset attendance

    Object.assign(appointment, rest);
    await appointment.save();

    res.status(200).json(appointment);
  } catch (err) {
    console.error('❌ Error updating appointment:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete appointment (tenant-safe)
export const deleteAppointment = async (req, res) => {
  try {
    await Appointment.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};

// Calendar Appointments
// export const getCalendarAppointments = async (req, res) => {
//   const { startDate, endDate, status } = req.query;

//   const query = {
//     date: { $gte: new Date(startDate), $lte: new Date(endDate) }
//   };

//   if (status && status !== 'all') {
//     query.status = status;
//   }

//   const appointments = await Appointment.find(query).populate('doctor patient');
//   res.json(appointments);
// };

export const getCalendarAppointments = async (req, res) => {
  const { startDate, endDate, status } = req.query;
  const query = {};

  if (startDate && !isNaN(Date.parse(startDate))) {
    query.date = { $gte: new Date(startDate) };
  }

  if (endDate && !isNaN(Date.parse(endDate))) {
    query.date = query.date || {};
    query.date.$lte = new Date(endDate);
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  try {
    console.log('📥 MongoDB query:', query);
    const appointments = await Appointment.find(query)
      .populate('doctorId')
      .populate('patientId');
    res.json(appointments);
  } catch (err) {
    console.error('❌ Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

export const getAvailabilityByDate = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ error: 'Missing doctorId or date' });

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    const availability = await Availability.findOne({ doctorId, dayOfWeek });
    if (!availability) return res.json({ availableSlots: [] });

    const booked = await Appointment.find({
      doctorId,
      date: new Date(date),
      status: { $ne: 'cancelled' }
    }).select('timeSlot');

    const bookedSlots = booked.map(a => a.timeSlot);
    const availableSlots = availability.timeSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({ availableSlots });
  } catch (err) {
    console.error('❌ getAvailabilityByDate error:', err);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};


export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, date, timeSlot, mode, notes, createdBy } = req.body;

    if (!doctorId || !patientId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const doctor = await User.findById(doctorId);
    const patient = await Patient.findById(patientId);
    if (!doctor || !patient) {
      return res.status(404).json({ error: 'Doctor or patient not found' });
    }

    const isLinked = doctor.linkedPatients?.includes(patient._id);

    const appointment = new Appointment({
      tenantId: doctor.tenantId,
      doctorId,
      patientId,
      date,
      timeSlot,
      mode,
      notes,
      createdBy,
      linkedAtBooking: isLinked,
      attended: false // ✅ default attendance
    });

    await appointment.save();

    try {
      patient.lastVisit = new Date(date);
      patient.visitCount = (patient.visitCount || 0) + 1;
      await patient.save();
    } catch (updateErr) {
      console.warn('Failed to update patient visit info:', updateErr);
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    console.error('Booking failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAppointmentAsAttended = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.attended = true;
    appointment.status = 'completed'; // ✅ optional override
    await appointment.save();

    res.status(200).json({ message: 'Marked as attended', appointment });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

export const updateAppointmentStatuses = async (req, res) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({ status: 'scheduled' });

    for (let appt of appointments) {
      const apptDateStr = appt.date.toISOString().slice(0, 10);
      const apptDateTime = new Date(`${apptDateStr}T${appt.timeSlot}`);

      if (apptDateTime < now) {
        appt.status = appt.attended ? 'completed' : 'expired';
        await appt.save();
      }
    }

    res.status(200).json({ message: 'Statuses updated successfully' });
  } catch (err) {
    console.error('Error updating statuses:', err);
    res.status(500).json({ error: 'Failed to update statuses' });
  }
};



export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    appointment.cancellation = {
      createdAt: new Date(),
      createdBy: req.user._id
    };

    await appointment.save();

    res.status(200).json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};
