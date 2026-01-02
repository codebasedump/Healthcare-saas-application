// import React from 'react';
// import axios from 'axios';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   faUser, faCalendar, faFilePrescription, faUsers,
//   faClipboardList, faSignOutAlt, faUserMd, faChartLine,
//   faStethoscope, faNotesMedical
// } from '@fortawesome/free-solid-svg-icons';
// import { useNavigate, NavLink } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
// import './Sidebar.css';

// export default function Sidebar() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem('token');
//   const decoded = token ? jwtDecode(token) : null;
//   const role = decoded?.role;
//   const avatar = decoded?.name?.[0]?.toUpperCase() || 'U';

//   const handleLogout = async () => {
//     const user = JSON.parse(localStorage.getItem('currentUser'));

//     try {
//       await axios.post('/api/auth/logout', { email: user.email });

//       // Clear session
//       localStorage.removeItem('token');
//       localStorage.removeItem('currentUser');

//       // Redirect to login
//       navigate('/');
//     } catch (err) {
//       console.error('Logout failed:', err);
//       alert('Something went wrong during logout.');
//     }
//   };

//   const navGroups = {
//     admin: [
//       { label: 'Dashboard', path: '/admin-dashboard', icon: faChartLine },
//       { label: 'Roster', path: '/admin-roster', icon: faChartLine },
//       { label: 'Users', path: '/admin-users', icon: faUsers },
//       { label: 'Appointments', path: '/admin-appointments', icon: faCalendar },
//       { label: 'Doctors', path: '/admin-doctors', icon: faUserMd },
//       { label: 'Logs', path: '/admin-audit', icon: faClipboardList },
//       // { label: 'Prescriptions', path: '/admin-prescriptions', icon: faFilePrescription },
//       { label: 'Manual Booking', path: '/admin/book-appointment', icon: faNotesMedical } // ✅ Add this line
//     ],
    
//     doctor: [
//       { label: 'Dashboard', path: '/doctor-dashboard', icon: faChartLine },
//       { label: 'Appointments', path: '/doctor-appointments', icon: faCalendar },
//       { label: 'Prescriptions', path: '/doctor-prescriptions', icon: faFilePrescription },
//       { label: 'Patients', path: '/doctor-patients', icon: faUser },
//     ],
//     receptionist: [
//       { label: 'Dashboard', path: '/reception-dashboard', icon: faChartLine },
//       { label: 'Schedule', path: '/reception-schedule', icon: faCalendar },
//       { label: 'Patients', path: '/reception-patients', icon: faUser },
//     ],
//     patient: [
//       { label: 'Dashboard', path: '/patient-dashboard', icon: faChartLine },
//       { label: 'Appointments', path: '/patient-appointments', icon: faCalendar },
//       { label: 'My Prescriptions', path: '/patient-prescriptions', icon: faFilePrescription },
//       { label: 'Browse Doctors', path: '/doctors', icon: faStethoscope },
//       { label: 'Book Appointment', path: '/book', icon: faNotesMedical }
//     ],
//   };

//   if (!role) {
//     return (
//       <aside className="sidebar">
//         <div className="logo">
//           <h2>Medicare</h2>
//         </div>
//         <p className="sidebar-error">Role not found. Please log in again.</p>
//         <button className="logout-btn" onClick={handleLogout}>
//           <FontAwesomeIcon icon={faSignOutAlt} /> Logout
//         </button>
//       </aside>
//     );
//   }

//   return (
//     <aside className="sidebar">
//       {/* User Info */}
//       <div className="user-info">
//         <div className="avatar">{avatar}</div>
//         <div className="username">{decoded?.name || 'User'}</div>
//       </div>

//       {/* Logo Section */}
//       <div className="logo">
//         <h2>Medicare</h2>
//       </div>

//       {/* Navigation Links */}
//       <ul className="nav-links">
//         {navGroups[role]?.map((link) => (
//           <li key={link.path}>
//             <NavLink
//               to={link.path}
//               className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
//               title={link.label}
//             >
//               <FontAwesomeIcon icon={link.icon} className="nav-icon" />
//               <span className="nav-label">{link.label}</span>
//             </NavLink>
//           </li>
//         ))}
//       </ul>

//       <button className="logout-btn" onClick={handleLogout}>
//         <FontAwesomeIcon icon={faSignOutAlt} /> Logout
//       </button>
//     </aside>
//   );
// }





import React from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faCalendar, faFilePrescription, faUsers,
  faClipboardList, faSignOutAlt, faUserMd, faChartLine,
  faStethoscope, faNotesMedical
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate, NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const role = decoded?.role;
  const avatar = decoded?.name?.[0]?.toUpperCase() || 'U';

  const handleLogout = async () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    try {
      await axios.post('/api/auth/logout', { email: user.email });
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Something went wrong during logout.');
    }
  };

  const navGroups = {
    admin: [
      { label: 'Dashboard', path: '/admin-dashboard', icon: faChartLine },
      { label: 'Users', path: '/admin-users', icon: faUsers },
      { label: 'Staffs', path: '/admin-doctors', icon: faUserMd },
      { label: 'Appointments', path: '/admin-appointments', icon: faCalendar },
      { label: 'Roster', path: '/admin-roster', icon: faCalendar },
      { label: 'Logs', path: '/admin-audit', icon: faClipboardList },
      // { label: 'Manual Booking', path: '/admin/book-appointment', icon: faNotesMedical }
    ],
    doctor: [
      { label: 'Dashboard', path: '/doctor-dashboard', icon: faChartLine },
      { label: 'Appointments', path: '/doctor-appointments', icon: faCalendar },
      { label: 'Prescriptions', path: '/doctor-prescriptions', icon: faFilePrescription },
      { label: 'Patients', path: '/doctor-patients', icon: faUser },
    ],
    receptionist: [
      { label: 'Dashboard', path: '/reception-dashboard', icon: faChartLine },
      { label: 'Schedule', path: '/reception-schedule', icon: faCalendar },
      { label: 'Patients', path: '/reception-patients', icon: faUser },
    ],
    patient: [
      { label: 'Dashboard', path: '/patient-dashboard', icon: faChartLine },
      { label: 'Appointments', path: '/patient-appointments', icon: faCalendar },
      { label: 'My Prescriptions', path: '/patient-prescriptions', icon: faFilePrescription },
      { label: 'Browse Doctors', path: '/doctors', icon: faStethoscope },
      { label: 'Book Appointment', path: '/book', icon: faNotesMedical }
    ],
  };

  if (!role) {
    return (
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="logo">Medicare</h2>
        </div>
        <p className="sidebar-error">Role not found. Please log in again.</p>
        <button className="logout-btn" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="logo">Medicare</h2>
        {/* <div className="user-info">
          <div className="avatar">{avatar}</div>
          <div className="username">{decoded?.name || 'User'}</div>
        </div> */}
      </div>

      <ul className="nav-links">
        {navGroups[role]?.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              title={link.label}
            >
              <FontAwesomeIcon icon={link.icon} className="nav-icon" />
              <span className="nav-label">{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <button className="logout-btn" onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} /> Logout
      </button>
    </aside>
  );
}