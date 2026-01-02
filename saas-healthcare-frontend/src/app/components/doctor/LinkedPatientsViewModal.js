import React, { useEffect, useState } from 'react';
import {
  getLinkedViewPatients,
  unlinkPatientFromDoctor,
} from '../../../services/userService';
import './Doctors.css';

export default function LinkedPatientsModal({ show, onClose, doctor }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmUnlinkId, setConfirmUnlinkId] = useState(null);

  const pageSize = 6;

  useEffect(() => {
    const fetchLinked = async () => {
      setLoading(true);
      try {
        const res = await getLinkedViewPatients(doctor._id);
        setPatients(res.data || []);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to load linked patients:', err);
      } finally {
        setLoading(false);
      }
    };

    if (show && doctor) fetchLinked();
  }, [show, doctor]);

  const handleUnlink = async (patientId) => {
    try {
      await unlinkPatientFromDoctor(doctor._id, patientId);
      setPatients((prev) => prev.filter((p) => p._id !== patientId));
    } catch (err) {
      console.error('Failed to unlink patient:', err);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'DOB'];
    const rows = patients.map((p) => [
      p.name,
      p.email,
      p.phone,
      new Date(p.dob).toLocaleDateString(),
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `linked_patients_${doctor.name}.csv`;
    link.click();
  };

  const filteredPatients = patients.filter((p) =>
    `${p.name} ${p.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (!show || !doctor) return null;

  return (
    <div className="modal-backdrop modalbox">
      <div className="modal-box widthadjust">
        <h3 className="modal-title">👩‍⚕️ Linked Patients for {doctor.name}</h3>

        <div className="modal-toolbar mt-5">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button className="btn btn-outline-primary" onClick={exportToCSV}>
            📄 Export CSV
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : paginatedPatients.length === 0 ? (
          <div className="empty-state">
            <p>No patients linked to this doctor.</p>
          </div>
        ) : (
          <>
            <div className="linked-patient-grid mt-5">
              {paginatedPatients.map((p) => {
                const lastVisit =
                  p.medicalHistory?.[p.medicalHistory.length - 1]?.createdAt;

                return (
                  <div key={p._id} className="patient-card">
                    <div className="avatar-circle">{p.name.charAt(0)}</div>
                    <div className="patient-details">
                      <strong>{p.name}</strong>
                      <span>{p.email}</span>
                      <span className="phone">{p.phone}</span>
                      <span className="dob">
                        DOB: {new Date(p.dob).toLocaleDateString()}
                      </span>
                      <span className="last-visit">
                        Last Visit:{' '}
                        {lastVisit
                          ? new Date(lastVisit).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                    <button
                        className="btn btn-danger btn-sm unlink-btn"
                        onClick={() => setConfirmUnlinkId(p._id)}
                        >
                        ❌ Unlink
                    </button>
                </div>
                );
              })}
            </div>

            <div className="pagination-controls mt-5">
              <button
                className="page-btn"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                ◀ Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="page-btn"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next ▶
              </button>
            </div>
          </>
        )}

        <div className="modal-actions mt-4">
            <button className="btn btn-secondary" onClick={onClose}>
                Close
            </button>
            </div>
        </div>

        {confirmUnlinkId && (
            <div className="confirm-modal">
                <div className="confirm-box">
                <h4>Are you sure you want to unlink this patient?</h4>
                <div className="modal-actions">
                    <button
                    className="btn btn-danger"
                    onClick={async () => {
                        await handleUnlink(confirmUnlinkId);
                        setConfirmUnlinkId(null);
                    }}
                    >
                    Yes, Unlink
                    </button>
                    <button
                    className="btn btn-secondary"
                    onClick={() => setConfirmUnlinkId(null)}
                    >
                    Cancel
                    </button>
                </div>
                </div>
            </div>
         )}
    </div>
  );
}