import React, { useState } from 'react';
import { getRosterSlots } from '../../../services/rosterService';
import './AvailableSlots.css'; // Make sure this CSS file is created

const AvailableSlots = ({ onClose }) => {
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await getRosterSlots(doctorId, date);
      setSlots(res.data.availableSlots || []);
    } catch (err) {
      alert('Error: ' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slots-container">
      <h2>Check Available Slots</h2>

      <div className="form-group">
        <label>Doctor ID</label>
        <input
          type="text"
          value={doctorId}
          onChange={e => setDoctorId(e.target.value)}
          placeholder="Enter Doctor ID"
        />
      </div>

      <div className="form-group">
        <label>Select Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <button className="fetch-btn" onClick={fetchSlots} disabled={!doctorId || !date}>
        {loading ? 'Fetching...' : 'Fetch Slots'}
      </button>

      <div className="slots-list">
        {slots.length === 0 ? (
          <p className="no-slots">No available slots for selected date.</p>
        ) : (
          <ul>
            {slots.map((slot, i) => (
              <li key={i} className="slot-item">{slot}</li>
            ))}
          </ul>
        )}
      </div>

      <button className="close-btn" onClick={onClose}>Close</button>
    </div>
  );
};

export default AvailableSlots;