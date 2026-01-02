import React, { useEffect, useState } from 'react';
import { getAllRosters } from '../../../services/rosterService';
import './RosterList.css';

const RosterList = () => {
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRosters = async () => {
      try {
        const res = await getAllRosters();
        setRosters(res.data || []);
      } catch (err) {
        alert('Error: ' + err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRosters();
  }, []);

  // Group rosters by doctor
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
    <div className="roster-list">
      <h2>Fortnight Roster Overview</h2>

      {loading ? (
        <p className="loading">Loading rosters...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="empty">No rosters available.</p>
      ) : (
        Object.values(grouped).map(group => (
          <div key={group.staff._id} className="doctor-roster-block">
            <h3>{group.staff.name} <span className="role">({group.staff.role})</span></h3>
            <p className="email">{group.staff.email}</p>
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Shift</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {group.entries.map(entry => (
                  <tr key={entry._id}>
                    <td>{new Date(entry.date).toLocaleDateString('en-AU', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}</td>
                    <td>{entry.startTime}–{entry.endTime}</td>
                    <td>{entry.shiftType}</td>
                    <td>{entry.location}</td>
                    <td>
                      <span className={`status-badge ${entry.status}`}>{entry.status}</span>
                    </td>
                    <td>{entry.tags?.join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default RosterList;