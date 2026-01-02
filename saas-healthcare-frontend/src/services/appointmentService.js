import api from './api';

// Existing exports...
export const getAppointments = () => api.get('/appointments');

export const getAppointmentsByDoctor = () => api.get('/appointments/me');

export const markAsAttended = (id) => api.patch(`/appointments/${id}/attend`);

export const cancelAppointment = (appointmentId) => api.patch(`/appointments/${appointmentId}/cancel`);

export const getUnlinkedPatients = () => api.get('/patients/unlinked');

export const linkPatientsToDoctor = (doctorId, patientIds) => api.post(`/doctors/${doctorId}/link`, { patientIds });

export const reassignPatientToDoctor = (payload) => api.post('/patients/reassign-patient', payload);

export const fetchAppointments = (params) => api.get('/appointments/calendar', { params });

export const updateAppointment = (updatedAppt) => api.patch(`/appointments/${updatedAppt._id}`, updatedAppt);

export const getRosterSlots = (doctorId, date) => api.get(`/doctors/${doctorId}/roster-slots`, { params: { date } });

export const bookAppointment = (payload) => api.post('/appointments/book', payload);


