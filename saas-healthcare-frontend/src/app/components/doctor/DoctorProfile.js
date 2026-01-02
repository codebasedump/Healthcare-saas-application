import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getDoctorProfileById } from '../../../services/doctorService';


const DoctorProfile = ({ doctorId }) => {
  const [availability, setAvailability] = useState([]);
  const [rating, setRating] = useState({ avgRating: 0, count: 0 });

  useEffect(() => {
    const fetchProfile = async () => {
        try {
        const res = await getDoctorProfileById(doctorId);
        setAvailability(res.data.availability);
        setRating(res.data.rating);
        } catch (err) {
        console.error('❌ Failed to fetch doctor profile:', err);
        }
    };
    fetchProfile();
    }, [doctorId]);


  return (
    <div className="doctor-profile">
      <h2>Doctor Availability</h2>
      {availability.map((slot, idx) => (
        <div key={idx}>
          <strong>{slot.dayOfWeek}</strong>: {slot.timeSlots.join(', ')}
        </div>
      ))}

      <h2>Rating</h2>
      <p>{rating.avgRating.toFixed(1)} ⭐ ({rating.count} reviews)</p>
    </div>
  );
};

export default DoctorProfile;