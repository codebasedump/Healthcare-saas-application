// components/PrivateRoute.js
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;

  const decoded = jwtDecode(token);
  const userRole = decoded?.role;
  const userStatus = decoded?.status;

  // Role mismatch
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Block suspended users unless they're admin
  if (userStatus === 'suspended' && userRole !== 'admin') {
    return <Navigate to="/suspended" replace />;
  }

  return children;
}