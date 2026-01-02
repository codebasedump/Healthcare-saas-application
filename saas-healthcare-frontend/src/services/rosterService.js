import api from './api';

// ✅ Get all rosters (admin view)
export const getAllRosters = () => api.get('/roster');

// ✅ Create a new roster entry
export const createRoster = (payload) => api.post('/roster', payload);

// ✅ Get available slots for a doctor on a specific date
export const getRosterSlots = (doctorId, date) =>
  api.get(`/roster/doctors/${doctorId}/roster-slots`, { params: { date } });

// ✅ Bulk create rosters
export const bulkCreateRosters = (payload) => api.post('/roster/bulk', payload);

// ✅ Get roster by ID
export const getRosterById = (rosterId) => api.get(`/roster/${rosterId}`);
// ✅ Update roster
export const updateRoster = (rosterId, payload) => api.patch(`/roster/${rosterId}`, payload);

// ✅ Cancel roster
export const cancelRoster = (rosterId) => api.patch(`/roster/${rosterId}/cancel`);

// ✅ (Optional) Delete roster
export const deleteRoster = (rosterId) => api.delete(`/roster/${rosterId}`);

// ✅ (Optional) Filter rosters by query params
export const filterRosters = (filters) => api.get('/roster', { params: filters });

// ✅ (Optional) Export roster data as CSV
export const exportRosterCSV = () =>
  api.get('/roster/export', { responseType: 'blob' });


