import api from './api';

// 🔍 Search prescriptions with filters (paginated)
export const searchPrescriptions = async ({
  query = '',
  page = 1,
  limit = 5,
  startDate = '',
  endDate = '',
  doctorIds = [],
  patientIds = []
} = {}) => {
  const params = new URLSearchParams();

  if (query) params.append('query', query);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  doctorIds.forEach(id => params.append('doctorIds', id));
  patientIds.forEach(id => params.append('patientIds', id));

  const res = await api.get(`/prescriptions/search?${params.toString()}`);
  return res.data;
};

// 📤 Export prescriptions as CSV
export const exportPrescriptions = async ({
  query = '',
  startDate = '',
  endDate = '',
  doctorIds = [],
  patientIds = []
} = {}) => {
  const params = new URLSearchParams();

  if (query) params.append('query', query);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  doctorIds.forEach(id => params.append('doctorIds', id));
  patientIds.forEach(id => params.append('patientIds', id));

  const res = await api.get(`/prescriptions/export?${params.toString()}`, {
    responseType: 'blob',
    validateStatus: status => status < 500
  });

  return res; // Blob response for CSV download
};

// ✏️ Admin: Update prescription
export const updatePrescription = async (id, data) => {
  const res = await api.patch(`/prescriptions/${id}`, data);
  return res.data; // Updated prescription
};

// 🗑️ Admin: Delete prescription
export const deletePrescription = async (id) => {
  const res = await api.delete(`/prescriptions/${id}`);
  return res.data; // { message: 'Prescription deleted successfully' }
};

// 🔐 Admin: Get all prescriptions (non-paginated, fallback)
export const getPrescriptions = async () => {
  const res = await api.get('/prescriptions');
  return {
    prescriptions: res.data.prescriptions,
    total: res.data.total
  };
};
