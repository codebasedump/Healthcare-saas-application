import React, { useEffect, useState } from 'react';
import { getDoctors, getDoctorRating } from '../../../services/doctorService';
import DoctorCard from '../../components/doctor/DoctorCard';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const fetchDoctorsAndRatings = async () => {
      try {
        const res = await getDoctors();
        setDoctors(res.data);

        const ratingMap = {};
        for (const doc of res.data) {
          const ratingRes = await getDoctorRating(doc._id);
          ratingMap[doc._id] = ratingRes.data;
        }
        setRatings(ratingMap);
      } catch (err) {
        console.error('❌ Failed to load doctors:', err);
      }
    };

    fetchDoctorsAndRatings();
  }, []);

  return (
    <div className="doctor-list">
      <h2>Available Doctors</h2>
      {doctors.length === 0 ? (
        <p>No doctors found.</p>
      ) : (
        doctors.map(doc => (
          <DoctorCard key={doc._id} doctor={doc} rating={ratings[doc._id]} />
        ))
      )}
    </div>
  );
};

export default DoctorList;