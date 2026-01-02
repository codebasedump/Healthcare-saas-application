import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { jwtDecode } from 'jwt-decode';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = token ? jwtDecode(token) : null;
  const avatar = decoded?.name?.[0]?.toUpperCase() || 'U';
  const user = JSON.parse(localStorage.getItem('currentUser'));
  
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', { email: user.email });

      // Clear session
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');

      // Redirect to login
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Something went wrong during logout.');
    }
  };


  return (
    <header className="header">
      <h2>Welcome to Admin Dashboard</h2>
      <div className="header-right">
        <div className="header-username">{user.name}</div>
        <button className="header-logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>
    </header>
  );
}