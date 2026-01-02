import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });

      const user = res.data?.user;
      const token = res.data?.token;
      const mfaRequired = res.data?.mfaRequired;

      if (!user) throw new Error('No user received');

      // Save user info
      localStorage.setItem('currentUser', JSON.stringify(user));

      // 🔐 MFA logic
      if (mfaRequired || user.mfaEnabled) {
        if (!user.mfaSecret) {
          navigate('/setup-mfa'); 
        } else {
          navigate('/verify-otp');
        }
        return;
      }

      // ✅ Proceed with token
      if (token) {
        localStorage.setItem('token', token);

        switch (user.role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'doctor':
            navigate('/doctor-dashboard');
            break;
          case 'receptionist':
            navigate('/reception-dashboard');
            break;
          default:
            navigate('/unauthorized');
        }
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-light mt-5 w-50 mx-auto">
      <h4 className="mb-3 text-center">Login</h4>
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-100">Login</button>
    </form>
  );
}
