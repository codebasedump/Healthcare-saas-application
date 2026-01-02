import React, { useEffect, useState } from 'react';
import {
  linkPatientsToUser,
  getUnlinkedPatients,
} from '../../../services/userService';
import { toast } from 'react-toastify';
import './Doctors.css';

export default function LinkPatientsModal({ show, onClose, userId, onLinked }) {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getUnlinkedPatients(userId); // ✅ Only fetch unlinked patients
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error('Failed to fetch unlinked patients:', err);
        toast.error('❌ Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    if (show) fetchData();
  }, [show, userId]);

  const handleToggle = (patientId) => {
    setSelected((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSubmit = async () => {
    try {
      await linkPatientsToUser(userId, selected);
      toast.success('✅ Patients linked successfully');
      onLinked();
      onClose();
    } catch {
      toast.error('❌ Failed to link patients');
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop modalbox">
      <div className="modal-box">
        <h3 className="modal-title">🔗 Link Patients</h3>

        {loading ? (
          <p>Loading patients...</p>
        ) : patients.length === 0 ? (
          <p>No unlinked patients available.</p>
        ) : (
          <div className="patient-list mt-4">
            {patients.map((p) => (
              
              <div
                key={p._id}
                className={`patient-card ${selected.includes(p._id) ? 'selected' : ''}`}
                title={p.email}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(p._id)}
                  onChange={() => handleToggle(p._id)}
                  onClick={(e) => e.stopPropagation()} // ✅ Prevent parent click
                />
                <div
                  className="patient-info"
                  onClick={() => handleToggle(p._id)} // ✅ Only toggle when info is clicked
                >
                  <strong>{p.name}</strong>
                  <span className="email">{p.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions mt-4">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selected.length === 0}
          >
            Link
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}