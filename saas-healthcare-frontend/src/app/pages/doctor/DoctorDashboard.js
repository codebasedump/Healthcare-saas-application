import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import withAccessControl from '../../../hoc/withAccessControl';
import { getDoctorPatients } from '../../../services/doctorService';
import { getAppointmentsByDoctor } from '../../../services/appointmentService';
import { isDoctor } from '../../../utils/authUtils';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (isDoctor()) {
      getDoctorPatients()
        .then(res => {
          setPatients(res.data);
          toast.success('✅ Patients loaded successfully');
        })
        .catch(err => {
          console.error('Failed to fetch patients:', err);
          toast.error('❌ Failed to load patients.');
        });

      getAppointmentsByDoctor()
        .then(res => {
          setAppointments(res.data);
          toast.success('✅ Appointments loaded successfully');
        })
        .catch(err => {
          console.error('Failed to fetch appointments:', err);
          toast.error('❌ Failed to load appointments.');
        });
    } else {
      console.warn('Skipped doctor API: not a doctor');
      toast.warning('🚫 Access denied: This dashboard is for doctors only.');
    }
  }, []);

  return (
    <DashboardLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <h2>Welcome, Doctor</h2>

      <section>
        <h3>Your Patients</h3>
        {patients.length > 0 ? (
          <ul>
            {patients.map(p => (
              <li key={p._id}>
                {p.name} — {p.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No patients found.</p>
        )}
      </section>

      <section>
        <h3>Upcoming Appointments</h3>
        {appointments.length > 0 ? (
          <ul>
            {appointments.map(app => (
              <li key={app._id}>
                {new Date(app.date).toLocaleDateString()} at {app.timeSlot} with{' '}
                {app.patientId?.name || 'Unknown Patient'}
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming appointments.</p>
        )}
      </section>
    </DashboardLayout>
  );
}

export default withAccessControl(DoctorDashboard);