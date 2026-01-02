import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
function MfaSetup({ email }) {
  const navigate = useNavigate();
  const [qr, setQr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mfa/setup-mfa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => res.json())
      .then(data => {
        setQr(data.qr);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load MFA QR:', err);
        setLoading(false);
      });
  }, [email]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Set Up MFA</h2>
      <p>Scan this QR code with Google Authenticator</p>
      {loading && <p>Loading QR code...</p>}
      {qr && <img src={qr} alt="MFA QR Code" style={{ width: '250px' }} />}

      <button className="btn btn-primary mt-3" onClick={() => navigate('/verify-otp')}>
        Proceed to OTP Verification
      </button>

    </div>
  );
}

export default MfaSetup;