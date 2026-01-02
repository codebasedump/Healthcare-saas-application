import React from 'react';

const DoctorCard = ({ doctor, rating }) => {
  return (
    <div className="doctor-card">
      <h3>{doctor.name}</h3>
      <p><strong>Specialty:</strong> {doctor.specialty || 'General Practitioner'}</p>
      <p><strong>Department:</strong> {doctor.department || 'General Medicine'}</p>
      <p><strong>Rating:</strong> {rating?.avgRating?.toFixed(1) || 'N/A'} ⭐ ({rating?.count || 0} reviews)</p>
    </div>
  );
};

export default DoctorCard;