import { useEffect, useState } from 'react';
import { getLogs, exportLogsCSV } from '../../../services/logService';
import DashboardLayout from '../../components/common/DashboardLayout';
import '../../pages/pages-common.css';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ user: '', action: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);      // Total number of logs
  const pageSize = 50;                   

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getLogs({ ...filters, page });
      setLogs(res.data.logs);
      setTotal(res.data.total); 
    } catch (err) {
      console.error('❌ Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters, page]);

  const handleExportCSV = async () => {
    try {
      const response = await exportLogsCSV();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit_logs.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('❌ Failed to export logs:', err);
    }
  };

  const actionIcons = {
    view: '👁',
    edit: '✏️',
    login: '🔐',
    delete: '🗑',
  };

  return (
    <DashboardLayout>
      <div className="audit-log-container">

            <div className="page-header">
              <h2 className="page-title">Audit Logs</h2>
              <button onClick={handleExportCSV} className="action-btn info">Export CSV</button>
            </div>
       
        <div className="filters mb-3">
          <input
            type="text"
            placeholder="User name"
            value={filters.user}
            onChange={e => setFilters(f => ({ ...f, user: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Action"
            value={filters.action}
            onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
          />

        </div>
       
        {loading ? (
          <p>Loading logs...</p>
        ) : logs.length > 0 ? (
          <ul className="audit-log-list">
            {logs.map((log, index) => (
              <li key={index} className="audit-log-entry">
                <div className="log-timestamp">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className="log-message">
                  {actionIcons[log.action?.toLowerCase()] || '📝'} {log.action} by{' '}
                  <span className="log-user">{log.userId?.name || 'Unknown User'}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No audit logs available.</p>
        )}


        {/* Pagination */}
      <div className="pagination-container mt-4">
        <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="page-nav">
          ◀ Prev
        </button>
        {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => (
          <button type="button"
            key={i}
            className={`page-btn ${page === i + 1 ? 'active' : ''}`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button type="button"
          disabled={page * pageSize >= total}
          onClick={() => setPage(page + 1)}
          className="page-nav"
        >
          Next ▶
        </button>
      </div>


      </div>
    </DashboardLayout>
  );
}