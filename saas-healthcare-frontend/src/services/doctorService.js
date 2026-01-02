import api from './api';

export const getDoctors = async () => {
  const response = await api.get('/doctors');
  return response.data; // ✅ returns the array directly
};

export const getClinicalDoctorsForAdmin = async () => {
  const response = await api.get('/doctors/clinical');
  return response.data; // ✅ returns array of doctors
};

export const getClinicalDoctorsForDoctor = async () => {
  const response = await api.get('/doctors/clinical/doctors');
  return response.data; // ✅ also returns array
};

export const getDoctorProfile = () => api.get('/doctors/me');

export const updateDoctorStatus = (id, isActive) => api.patch(`/doctors/${id}/status`, { isActive });

export const updateDoctorProfile = (id, payload) => api.put(`/doctors/${id}`, payload);

export const createDoctor = (payload) => api.post('/doctors/create', payload);

export const getDoctorPatients = () => api.get('/doctors/me/patients');

export const getDoctorStats = (id) => api.get(`/doctors/${id}/stats`);

export const getDoctorLogs = (id) => api.get(`/doctors/${id}/logs`);

export const resetDoctorMFA = (id) => api.post(`/doctors/${id}/reset-mfa`);

export const toggleDoctorMFA = (id) => api.post(`/doctors/${id}/toggle-mfa`);

export const getDoctorAvailability = (id, day) => api.get(`/availability?doctorId=${id}&dayOfWeek=${day}`);

// ✅ Get availability by doctor and date
export const getDoctorAvailabilityByDate = async (doctorId, date) => {
  const res = await api.get('/availability/date', {
    params: { doctorId, date }
  });
  return res.data;
};

// ✅ Book an appointment
export const bookAppointment = async (payload) => {
  const res = await api.post('/appointments/book', payload);
  return res.data;
};

export const getDoctorRating = (id) => api.get(`/reviews/summary?doctorId=${id}`);

export const getDoctorProfileById = (id) => api.get(`/doctors/${id}/profile`);

// Doctor: Create prescription
export const createPrescription = async (data) => {
  const res = await api.post('/prescriptions', data);
  return res.data;
};

// 👥 Doctor: Get patients
export const getPatients = async () => {
  const res = await api.get('/patients');
  return res.data;
};

export const getPaginatedDoctors = async (params) => {
  const res = await api.get('/doctors/paginated', { params });
  return res.data;
};

