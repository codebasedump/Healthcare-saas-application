import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { getPatients, createPrescription } from '../../../services/doctorService';
import { getAppointments } from '../../../services/appointmentService';
import { toast } from 'react-toastify';


export default function DoctorPrescriptions() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    appointmentId: '',
    medications: [{ name: '', dosage: '', frequency: '' }],
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await getPatients();
        const aRes = await getAppointments();
        setPatients(pRes.data);
        setAppointments(aRes.data);
      } catch (err) {
        toast.error('❌ Failed to load patients or appointments');
      }
    };
    fetchData();
  }, []);

  const handleMedChange = (i, field, value) => {
    const meds = [...form.medications];
    meds[i][field] = value;
    setForm({ ...form, medications: meds });
  };

  const addMedication = () => {
    setForm({
      ...form,
      medications: [...form.medications, { name: '', dosage: '', frequency: '' }]
    });
  };

  const handleSubmit = async () => {
    try {
      await createPrescription(form);
      toast.success('✅ Prescription created');
      setForm({
        patientId: '',
        appointmentId: '',
        medications: [{ name: '', dosage: '', frequency: '' }],
        notes: ''
      });
    } catch (err) {
      toast.error('❌ Failed to create prescription');
    }
  };

  return (
    <DashboardLayout>
      <h2>Create Prescription</h2>

      <label>Patient:</label>
      <select
        value={form.patientId}
        onChange={(e) => setForm({ ...form, patientId: e.target.value })}
      >
        <option value="">Select</option>
        {patients.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      <label>Appointment:</label>
      <select
        value={form.appointmentId}
        onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
      >
        <option value="">Select</option>
        {appointments.map((a) => (
          <option key={a._id} value={a._id}>
            {new Date(a.date).toLocaleDateString()}
          </option>
        ))}
      </select>

      <label>Medications:</label>
      {form.medications.map((m, i) => (
        <div key={i}>
          <input
            placeholder="Name"
            value={m.name}
            onChange={(e) => handleMedChange(i, 'name', e.target.value)}
          />
          <input
            placeholder="Dosage"
            value={m.dosage}
            onChange={(e) => handleMedChange(i, 'dosage', e.target.value)}
          />
          <input
            placeholder="Frequency"
            value={m.frequency}
            onChange={(e) => handleMedChange(i, 'frequency', e.target.value)}
          />
        </div>
      ))}
      <button onClick={addMedication}>Add Medication</button>

      <label>Notes:</label>
      <textarea
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      <button onClick={handleSubmit}>Submit</button>
    </DashboardLayout>
  );
}