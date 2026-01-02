import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import LoginForm from './app/pages/auth/LoginForm';
import MfaSetup from './app/pages/auth/MfaSetup';
import VerifyOtp from './app/pages/auth/VerifyOtp';
import Unauthorized from './app/pages/auth/Unauthorized';
import Suspended from './app/pages/system/Suspended';
import NotFound from './app/pages/system/NotFound';

// Admin Pages
import AdminDashboard from './app/pages/admin/AdminDashboard';
import AdminUsers from './app/pages/admin/AdminUsers';
import AdminAppointments from './app/pages/admin/AdminAppointments';
import AdminDoctors from './app/pages/admin/AdminDoctors';
import AdminAudit from './app/pages/admin/AdminAudit';
import AdminPrescriptions from './app/pages/admin/AdminPrescriptions';
import AdminRoster from './app/pages/admin/AdminRoster';

// Doctor Pages
import DoctorDashboard from './app/pages/doctor/DoctorDashboard';
import DoctorPrescriptions from './app/pages/doctor/DoctorPrescriptions';
import DoctorList from './app/pages/doctor/DoctorList';
import PatientPrescriptions from './app/pages/doctor/PatientPrescriptions';

// Logs
import Logs from './app/pages/system/Logs';

// Shared Components
import DoctorProfile from './app/components/doctor/DoctorProfile';
import BookingForm from './app/components/booking/BookingForm';

// Route Guards
import PrivateRoute from './app/components/common/PrivateRoute';
import RoleRedirect from './app/components/common/RoleRedirect';



function AppWrapper() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const showNavbar = token && location.pathname !== '/';

  return (
    <>
      {/* Optional: Add Sidebar/Header if showNavbar is true */}
      {/* {showNavbar && <Sidebar />} */}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/setup-mfa" element={<MfaSetup email="admin@hoffstee.com" />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/suspended" element={<Suspended />} />

        {/* Role Redirect */}
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={
          <PrivateRoute requiredRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />

        <Route path="/admin-roster"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminRoster />
            </PrivateRoute>
          }
        />

        <Route path="/admin-users" element={
          <PrivateRoute requiredRole="admin">
            <AdminUsers />
          </PrivateRoute>
        } />

        <Route path="/admin-appointments" element={
          <PrivateRoute requiredRole="admin">
            <AdminAppointments />
          </PrivateRoute>
        } />

        <Route path="/admin-doctors" element={
          <PrivateRoute requiredRole="admin">
            <AdminDoctors />
          </PrivateRoute>
        } />

        <Route path="/admin-audit" element={
          <PrivateRoute requiredRole="admin">
            <Logs />
          </PrivateRoute>
        } />

        <Route path="/admin-prescriptions" element={
          <PrivateRoute requiredRole="admin">
            <AdminPrescriptions />
          </PrivateRoute>
        } />

        <Route path="/admin/book-appointment" element={
          <PrivateRoute requiredRole="admin">
            <BookingForm tenantId={localStorage.getItem('tenantId')} />
          </PrivateRoute>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor-dashboard" element={
          <PrivateRoute requiredRole="doctor">
            <DoctorDashboard />
          </PrivateRoute>
        } />
        <Route path="/doctor-prescriptions" element={
          <PrivateRoute requiredRole="doctor">
            <DoctorPrescriptions />
          </PrivateRoute>
        } />

        {/* Patient Routes */}
        <Route path="/patient-prescriptions" element={
          <PrivateRoute requiredRole="patient">
            <PatientPrescriptions />
          </PrivateRoute>
        } />

        {/* Shared Routes */}
        <Route path="/doctor/:doctorId/profile" element={
          <PrivateRoute requiredRole="patient">
            <DoctorProfile />
          </PrivateRoute>
        } />
        <Route path="/book" element={
          <PrivateRoute requiredRole="patient">
            <BookingForm tenantId={localStorage.getItem('tenantId')} />
          </PrivateRoute>
        } />
        <Route path="/doctors" element={
          <PrivateRoute requiredRole="patient">
            <DoctorList />
          </PrivateRoute>
        } />

        {/* Default Redirect */}
        <Route path="/home" element={<Navigate to="/dashboard" />} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}