import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCalendarAlt, faLink } from '@fortawesome/free-solid-svg-icons';

export default function AppointmentActions({appt,
  onCancel,
  onReschedule,
  onReassign,
  onLink,
  selectedDoctorId,
  setSelectedPatient,
  setSelectedAppointment,
  setSelectedDoctor,
  setShowReassignModal
 }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" onClick={() => setOpen(!open)}>
       Actions
      </button>
      {open && (
        <ul className={`dropdown-menu-end dropdown-menu ${open ? 'show' : ''}`}>
          <li>
            <button className="dropdown-item action-link action-btn delete" onClick={() => onCancel(appt._id)} disabled={appt.status === 'cancelled'}>
             <FontAwesomeIcon icon={faTrash} className="me-1 text-danger" /> Cancel
            </button>
          </li>
          {/* <li>
            <button
              className="dropdown-item action-link action-btn edit"
              onClick={() => onReschedule(appt)}
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-warning" /> Reschedule
            </button>
          </li> */}

          <li>
            <button
              className="dropdown-item action-link action-btn reassign"
              onClick={() => onReassign(appt)}
            >
              <FontAwesomeIcon icon={faLink} className="me-1 text-primary" /> Reassign Patient
            </button>
          </li>

          {!appt.doctorId?.linkedPatients?.includes(appt.patientId?._id) && (
            <li>
              <button className="dropdown-item action-link action-btn view" onClick={() => onLink(appt.doctorId?._id)}>
                <FontAwesomeIcon icon={faLink} className="me-1 text-success" /> Link Patient
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}