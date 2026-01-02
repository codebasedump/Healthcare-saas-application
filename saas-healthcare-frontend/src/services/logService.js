import api from './api';

// Fetch audit logs with optional filters and pagination
export const getLogs = (params = {}) => {
  return api.get('/logs', { params });
};

// Export audit logs to CSV
export const exportLogsCSV = () => {
  return api.get('/logs/export', {
    responseType: 'blob' // ✅ Important for downloading CSV
  });
};
