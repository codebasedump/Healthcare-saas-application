import React, { useState, useEffect } from 'react';
import {
  getDoctors,
  getDoctorAvailabilityByDate,
  bookAppointment
} from '../../../services/doctorService';
import { getPatients } from '../../../services/patientService';

const BookingForm = ({ tenantId }) => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    getDoctors().then(setDoctors).catch(err => console.error('Doctor fetch error:', err));
    getPatients().then(setPatients).catch(err => console.error('Patient fetch error:', err));
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      getDoctorAvailabilityByDate(selectedDoctor, selectedDate)
        .then(res => setSlots(res.availableSlots || []))
        .catch(err => console.error('Availability fetch error:', err));
    }
  }, [selectedDoctor, selectedDate]);

  const handleBooking = async () => {
    try {
      await bookAppointment({
        doctorId: selectedDoctor,
        patientId: selectedPatient,
        date: selectedDate,
        timeSlot: selectedSlot,
        tenantId
      });
      alert('✅ Appointment booked!');
    } catch (err) {
      console.error('❌ Booking failed:', err);
      alert(err.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div className="booking-form">
      <h2>Book an Appointment</h2>

      <label>Doctor:</label>
      <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
        <option value="">Select Doctor</option>
        {doctors.map(doc => (
          <option key={doc._id} value={doc._id}>{doc.name}</option>
        ))}
      </select>

      <label>Patient:</label>
      <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
        <option value="">Select Patient</option>
        {patients.map(p => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>

      <label>Date:</label>
      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />

      <label>Time Slot:</label>
      <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}>
        <option value="">Select Time</option>
        {slots.map((slot, idx) => (
          <option key={idx} value={slot}>{slot}</option>
        ))}
      </select>

      <button onClick={handleBooking} disabled={!selectedSlot}>Book</button>
    </div>
  );
};

export default BookingForm;