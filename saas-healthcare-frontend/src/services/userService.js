import api from './api';

export const getUsers = () => api.get('/users');

export const getDoctors = () => api.get('/users', { params: { role: 'doctor' } });

export const getUserById = (id) => api.get(`/users/${id}`);

export const createUser = (data) => api.post('/users', data);

export const updateUser = (id, data) => api.put(`/users/${id}`, data);

export const deleteUser = (id) => api.delete(`/users/${id}`);

export const toggleMFA = (id) => api.put(`/users/${id}/mfa`);

export const getAllPatients = () => api.get('/patients');

// export const linkPatientsToUser = (userId, patientIds) => api.put(`/users/${userId}/link-patients`, { patientIds });
export const linkPatientsToUser = (userId, patientIds) => api.put(`/patients/${userId}/link-patients`, { patientIds });

export const getLinkedViewPatients = (doctorId) => api.get(`/patients/${doctorId}/linked-patients`);

export const unlinkPatientFromDoctor = (doctorId, patientId) => api.put(`/patients/${doctorId}/unlink-patient/${patientId}`);

export const getUnlinkedPatients = (doctorId) =>api.get(`/patients/${doctorId}/unlinked-patients`);

export const updateUserRole = (userId, role) => api.put(`/users/${userId}/role`, { role });

export const toggleUserStatus = (userId, status ) => api.put(`/users/${userId}/status`, { status });

// export const fetchMfaUsers = () => api.get('/users/mfa-users');

// ✅ Get all active staff (doctors, receptionists, nurses, etc.)
export const getActiveStaff = () => api.get('/users/staff');

// ✅ (Optional) Get users by role
export const getUsersByRole = (role) => api.get('/users', { params: { role } });

export const searchUsers = async (query = '', role = 'all', page = 1, limit = 10) => {
  try {
    const response = await api.get('/users/search', {
      params: {
        query: query.trim(),
        ...(role !== 'all' && { role }),
        page,
        limit
      }
    });
    if (response?.status === 200 && response?.data?.success) {
      return response.data;
    } else {
      console.warn('⚠️ Unexpected response format:', response);
      return { users: [], pagination: {} };
    }
  } catch (error) {
    console.error('❌ searchUsers failed:', error);
    return { users: [], pagination: {} };
  }
};

export const fetchRoles = async () => {
  try {
    const response = await api.get('/roles'); // ✅ updated path
    if (response?.status === 200 && Array.isArray(response.data)) {
      return response.data; // returns [{ name: "admin" }, ...]
    } else {
      console.warn('⚠️ Unexpected roles response:', response);
      return [];
    }
  } catch (error) {
    console.error('❌ Failed to fetch roles:', error);
    return [];
  }
};

//export const exportAuditTrail = (userId) => api.get(`/users/${userId}/audit`);

export const exportAuditTrail = (userId, filters) => {
  const params = new URLSearchParams({
    userId,
    search: filters.search || '',
    from: filters.from || '',
    to: filters.to || '',
    page: filters.page || 1,
    limit: filters.limit || 10
  });

  return api.get(`/audit-trail?${params.toString()}`);
};






