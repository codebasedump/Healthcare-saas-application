// pages/PatientPrescriptions.js
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
// import { getMyPrescriptions } from '../../../services/prescriptionService';
import { getMyPrescriptions } from '../../../services/patientService';

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMyPrescriptions();
      setPrescriptions(res.data);
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <h2>My Prescriptions</h2>
      {prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Appointment</th>
              <th>Medications</th>
              <th>Notes</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p) => (
              <tr key={p._id}>
                <td>{p.doctorId?.name}</td>
                <td>{p.appointmentId?.date ? new Date(p.appointmentId.date).toLocaleDateString() : '—'}</td>
                <td>
                  {p.medications.map((m, i) => (
                    <div key={i}>{m.name} – {m.dosage} – {m.frequency}</div>
                  ))}
                </td>
                <td>{p.notes}</td>
                <td>
                  {p.pdfUrl ? (
                    <a href={p.pdfUrl} target="_blank" rel="noopener noreferrer">Download</a>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}