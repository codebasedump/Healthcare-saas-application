import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function VerifyOtp() {
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));

  const handleVerify = async () => {
    try {
      const res = await axios.post('/api/mfa/verify-otp', {
        email: user.email,
        token
      });

      localStorage.setItem('token', res.data.token);
      const role = user.role;

      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/unauthorized');
      }
    } catch (err) {
      alert('Invalid OTP');
    }
  };

  return (
    <div className="container mt-5 text-center">
      <h4>Enter OTP from Google Authenticator</h4>
      <input
        type="text"
        className="form-control w-25 mx-auto my-3"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter 6-digit OTP"
      />
      <button className="btn btn-success" onClick={handleVerify}>
        Verify OTP
      </button>
    </div>
  );
}