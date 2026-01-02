import React, { useEffect, useState } from 'react';
import { exportAuditTrail } from '../../../services/userService';
import './AuditTrailModal.css';

export default function AuditTrailModal({ userId, show, onClose }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (show && userId) {
      exportAuditTrail(userId, {
        search,
        from: dateRange.from,
        to: dateRange.to,
        page,
        limit: pageSize
      })
        .then(res => {
          setLogs(res.data.logs);
          setTotal(res.data.total);
        })
        .catch(() => {
          setLogs([]);
          setTotal(0);
        });
    }
  }, [show, userId, search, dateRange, page]);

  const downloadCSV = () => {
    const csv = logs.map(log =>
      `"${log.action}","${log.actor}","${new Date(log.timestamp).toLocaleString()}"`
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit-trail.csv';
    link.click();
  };

  const getIcon = (action) => {
    if (action.toLowerCase().includes('enable')) return '✅';
    if (action.toLowerCase().includes('disable') || action.toLowerCase().includes('deactivate')) return '❌';
    if (action.toLowerCase().includes('activate')) return '🟢';
    if (action.toLowerCase().includes('seed')) return '🌱';
    return '📄';
  };

  const getRowClass = (action) => {
    if (action.toLowerCase().includes('activate')) return 'row-green';
    if (action.toLowerCase().includes('deactivate')) return 'row-red';
    return '';
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop modalbox">
      <div className="modal-box audit-box widthadjust">
        <h2 className="modal-title">📊 Audit Trail</h2>

        <div className="audit-controls mt-5">
          <input
            type="text"
            placeholder="Search actions or actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
          <button className="btn btn-sm btn-outline" onClick={downloadCSV}>⬇️ Download CSV</button>
        </div>

        <div className="audit-table-wrapper mt-5">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Actor</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="3" className="empty-row">No logs found</td></tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx} className={getRowClass(log.action)}>
                    <td>{getIcon(log.action)} {log.action}</td>
                    <td>{log.actor}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
        <button
          className="pagination-btn"
          disabled={page === 1}
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        >
          ◀ Prev
        </button>

        <button className="pagination-current" disabled>
          Page {page} of {Math.ceil(total / pageSize)}
        </button>

        <button
          className="pagination-btn"
          disabled={page >= Math.ceil(total / pageSize)}
          onClick={() => setPage(prev => prev + 1)}
        >
          Next ▶
        </button>
      </div>


        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}