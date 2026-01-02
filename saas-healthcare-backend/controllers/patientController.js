import Patient from '../models/Patient.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js'; // Add this import

// Admin: Get all patients for tenant
export const getAllPatients = async (req, res) => {
  if (!req.user?.tenantId) {
    return res.status(400).json({ error: 'Tenant ID missing' });
  }

  const patients = await Patient.find({ tenantId: req.user.tenantId });
  res.json(patients);
};

// Link patients to doctor
export const linkPatients = async (req, res) => {
  try {
    const { patientIds } = req.body;
    const doctor = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found or invalid role' });
    }

    const updatedLinks = Array.from(new Set([
      ...doctor.linkedPatients.map(id => id.toString()),
      ...patientIds
    ]));

    doctor.linkedPatients = updatedLinks;

    doctor.auditTrail.push({
      action: 'Patients linked',
      actor: req.user.name,
      timestamp: new Date()
    });

    await doctor.save();

    // ✅ Update existing appointments to reflect new linkage
    await Appointment.updateMany(
      {
        patientId: { $in: patientIds },
        tenantId: req.user.tenantId
      },
      {
        doctorId: doctor._id
      }
    );

    // ✅ Create missing appointments for newly linked patients
    for (const patientId of patientIds) {
      const existing = await Appointment.findOne({
        patientId,
        tenantId: req.user.tenantId
      });

      if (!existing) {
        // Create new appointment
        await Appointment.create({
          patientId,
          doctorId: doctor._id,
          tenantId: req.user.tenantId,
          date: new Date(),
          timeSlot: '—',
          status: 'linked',
          mode: '—',
          notes: '',
        });

        doctor.auditTrail.push({
          action: 'Appointment auto-created for linked patient',
          actor: req.user.name,
          timestamp: new Date(),
          target: patientId
        });

        await doctor.save();
      } else if (existing.doctorId.toString() !== doctor._id.toString()) {
        // Fix mismatched doctor assignment
        existing.doctorId = doctor._id;
        await existing.save();

        doctor.auditTrail.push({
          action: 'Appointment reassigned to correct doctor',
          actor: req.user.name,
          timestamp: new Date(),
          target: patientId
        });

        await doctor.save();
      }

    }
    res.json(doctor);
  } catch (err) {
    console.error('Failed to link patients:', err);
    res.status(500).json({ error: 'Failed to link patients' });
  }
};

// Get linked patients for doctor
export const getLinkedPatients = async (req, res) => {
  try {
    const doctor = await User.findOne(
      { _id: req.params.id, tenantId: req.user.tenantId },
      'linkedPatients'
    ).populate('linkedPatients');

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(doctor.linkedPatients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve linked patients' });
  }
};

// View linked patients (detailed)
export const getLinkedViewPatients = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found or invalid role' });
    }

    const patients = await Patient.find({ _id: { $in: doctor.linkedPatients } });
    res.status(200).json({ patients });
  } catch (err) {
    console.error('Failed to fetch linked patients:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Unlink patient from doctor
export const unlinkPatientFromDoctor = async (req, res) => {
  const { doctorId, patientId } = req.params;

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found or invalid role' });
    }

    doctor.linkedPatients = doctor.linkedPatients.filter(
      (id) => id.toString() !== patientId
    );

    await doctor.save();

    // ✅ Optionally mark appointments as unlinked or reassign
    await Appointment.updateMany(
      {
        doctorId: doctor._id,
        patientId: patientId
      },
      {
        $set: { status: 'unlinked' } // or doctorId: null
      }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unlink error:', err);
    res.status(500).json({ error: 'Failed to unlink patient' });
  }
};

// Get unlinked patients for tenant
export const getUnlinkedPatients = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID missing' });
    }

    const doctors = await User.find({ tenantId, role: 'doctor' });
    const linkedIds = doctors.flatMap((doc) =>
      doc.linkedPatients.map((id) => id.toString())
    );

    const unlinkedPatients = await Patient.find({
      tenantId,
      _id: { $nin: linkedIds },
    });

    res.status(200).json({ patients: unlinkedPatients });
  } catch (err) {
    console.error('Failed to fetch unlinked patients:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reassign patient from one doctor to another
export const reassignPatientToDoctor = async (req, res) => {
  const { patientId, fromDoctorId, toDoctorId } = req.body;

  if (!patientId || !fromDoctorId || !toDoctorId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [fromDoctor, toDoctor] = await Promise.all([
      User.findById(fromDoctorId),
      User.findById(toDoctorId)
    ]);

    if (!fromDoctor || fromDoctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Source doctor not found or invalid role' });
    }

    if (!toDoctor || toDoctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Target doctor not found or invalid role' });
    }

    // Remove patient from source doctor
    fromDoctor.linkedPatients = fromDoctor.linkedPatients.filter(
      (id) => id.toString() !== patientId.toString()
    );
    fromDoctor.auditTrail.push({
      action: 'Patient unlinked',
      actor: req.user?.name || 'System',
      timestamp: new Date(),
      target: patientId
    });
    await fromDoctor.save();

    // Add patient to target doctor (avoid duplicates)
    const alreadyLinked = toDoctor.linkedPatients
      .map(id => id.toString())
      .includes(patientId.toString());

    if (!alreadyLinked) {
      toDoctor.linkedPatients.push(patientId);
    }

    toDoctor.auditTrail.push({
      action: 'Patient linked',
      actor: req.user?.name || 'System',
      timestamp: new Date(),
      target: patientId
    });
    await toDoctor.save();

    // Update appointments
    await Appointment.updateMany(
      { patientId, doctorId: fromDoctorId },
      { doctorId: toDoctorId }
    );

    res.status(200).json({ message: 'Patient reassigned successfully' });
  } catch (err) {
    console.error('Reassignment error:', err);
    res.status(500).json({ error: 'Failed to reassign patient' });
  }
};