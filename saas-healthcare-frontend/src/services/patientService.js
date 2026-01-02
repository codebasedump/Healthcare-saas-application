import api from './api';

// Patient: Get own prescriptions
export const getMyPrescriptions = async () => {
  const res = await api.get('/prescriptions/my');
  return res.data;
};

export const getPatients = async () => {
  const res = await api.get('/patients');
  return res.data;
}

export const getLinkedPatientsForDoctor = async (doctorId) => {
  return api.get(`/doctors/${doctorId}/patients`);
};

