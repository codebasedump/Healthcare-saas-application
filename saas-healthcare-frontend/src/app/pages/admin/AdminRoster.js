import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import RosterForm from '../../components/roster/RosterForm';
import AvailableSlots from '../../components/roster/AvailableSlots';
import { getAllRosters, exportRosterCSV } from '../../../services/rosterService';
import '../../pages/pages-common.css';
import './AdminRosterPage.css'; // Add this CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash, faChartBar} from '@fortawesome/free-solid-svg-icons';

export default function RosterPage() {
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSlots, setShowSlots] = useState(false);

  useEffect(() => {
    const fetchRosters = async () => {
      try {
        const res = await getAllRosters();
        setRosters(res.data || []);
      } catch (err) {
        console.error('Error fetching rosters:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRosters();
  }, []);

  // Group rosters by staffId
  const grouped = rosters.reduce((acc, roster) => {
    const id = roster.staffId?._id || 'unknown';
    if (!acc[id]) {
      acc[id] = {
        staff: roster.staffId,
        entries: []
      };
    }
    acc[id].entries.push(roster);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="roster-page">
        {/* Header */}
        <div className="page-header">
          <h2>Roster Management</h2>
          <div className="header-actions">
            <button onClick={() => setShowForm(true)}>+ Create Roster</button>
            <button onClick={() => setShowSlots(true)}>Check Slots</button>
            <button className="export-btn" onClick={exportRosterCSV}>Export CSV</button>
          </div>
        </div>

        {/* Roster Grouped View */}
        {loading ? (
          <p className="loading">Loading rosters...</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="empty">No rosters found.</p>
        ) : (
          Object.values(grouped).map(group => (
            <div key={group.staff._id} className="doctor-group mt-5">
              <h3 className="doctor-name">
               👨‍⚕️ {group.staff.name} <span className="role">({group.staff.role})</span>
              </h3>
              <p className="email">{group.staff.email}</p>

              <div className="doctor-grid mt-3">
                {/* Header Row */}
                <div className="doctor-header">
                  <div>Date</div>
                  <div>Time</div>
                  <div>Shift</div>
                  <div>Location</div>
                  <div>Status</div>
                  <div>Tags</div>
                  <div>Actions</div>
                </div>

                {/* Data Rows */}
                {group.entries.map(entry => (
                  <div key={entry._id} className="doctor-row hover-row">
                    <div>{new Date(entry.date).toLocaleDateString()}</div>
                    <div>{entry.startTime}–{entry.endTime}</div>
                    <div>{entry.shiftType}</div>
                    <div>{entry.location}</div>
                    <div>
                      <span className={`status-badge ${entry.status}`}>{entry.status}</span>
                    </div>
                    <div>{entry.tags?.join(', ') || '—'}</div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="dropdown">
                        
                        <button
                          className="btn btn-sm btn-outline-secondary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          Actions
                        </button>
                        
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button className="dropdown-item action-link action-btn edit">
                              <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item action-link action-btn btn-audit">
                              <FontAwesomeIcon icon={faChartBar} className="me-1" /> Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          ))
        )}

        {/* Modal: Create Roster */}
        {showForm && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setShowForm(false)} aria-label="Close">×</button>
              <RosterForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}

        {/* Modal: Check Slots */}
        {showSlots && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setShowSlots(false)} aria-label="Close">×</button>
              <AvailableSlots onClose={() => setShowSlots(false)} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}