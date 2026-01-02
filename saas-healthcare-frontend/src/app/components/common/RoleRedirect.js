import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function RoleRedirect() {
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;

  const role = decoded?.role;
  const status = decoded?.status;

  if (!role) return <Navigate to="/" />;
  if (status === 'suspended') return <Navigate to="/suspended" />;

  const routeMap = {
    admin: '/admin-dashboard',
    doctor: '/doctor-dashboard',
    receptionist: '/reception-dashboard',
    patient: '/patient-dashboard',
  };

  return <Navigate to={routeMap[role]} />;
}