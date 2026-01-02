// src/services/dashboardService.ts
import api from './api';

export const getDashboardMetrics = () => api.get('/dashboard/metrics');

export const getSpecialties = () => api.get('/doctors/specialties');
