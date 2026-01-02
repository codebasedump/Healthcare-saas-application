import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './UserModal.css';
import { updateUser, fetchRoles } from '../../../services/userService';

export default function UserEditModal({ show, onClose, user, onUpdated }) {
  const [form, setForm] = useState({
    name: '', email: '', role: '', phone: '',
    status: 'active', department: '', specialty: ''
  });

  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        phone: user.phone || '',
        status: user.status || 'active',
        department: user.department || '',
        specialty: user.specialty || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const loadRoles = async () => {
      const fetchedRoles = await fetchRoles();
      setRoles(fetchedRoles);
    };
    if (show) loadRoles();
  }, [show]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email required';
    if (!form.phone.trim() || form.phone.length < 8) newErrors.phone = 'Valid phone number required';
    if (currentUser.role === 'superadmin' && !form.role) newErrors.role = 'Role is required';
    return newErrors;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('❌ Please fix the errors before submitting');
      return;
    }

    updateUser(user._id, form)
      .then(() => {
        toast.success('✅ User updated successfully');
        onUpdated();
        onClose();
      })
      .catch(() => toast.error('❌ Update failed'));
  };

  if (!show || !user) return null;

  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="modal-backdrop modalbox">
      <div className="modal-box">
        <h2 className="modal-title">✏️ Edit User</h2>
        <form onSubmit={handleSubmit} className="form mt-5">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className={errors.name ? 'input-error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            required
            className={errors.phone ? 'input-error' : ''}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}

          {currentUser.role === 'superadmin' ? (
            <>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className={errors.role ? 'input-error' : ''}
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {capitalize(role)}
                  </option>
                ))}
              </select>
              {errors.role && <span className="error-text">{errors.role}</span>}
            </>
          ) : (
            <span className="badge bg-secondary badgerole">{capitalize(user.role)}</span>
          )}

          <select name="status" value={form.status} onChange={handleChange} required>
            <option value="active">🟢 Active</option>
            <option value="suspended">🔴 Suspended</option>
          </select>

          {form.role === 'doctor' && (
            <>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
              />
              <input
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
                placeholder="Specialty"
              />
            </>
          )}

          {/* MFA Toggle */}
          <div className="field">
            <strong>MFA:</strong>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={user.mfaEnabled}
                onChange={() => toast.info('⚙️ MFA toggle triggered')}
                disabled={user.role === 'patient'}
                aria-label="Toggle MFA"
              />
              <span className="slider"></span>
            </label>
            <span className={`mfa-status ${user.mfaEnabled ? 'enabled' : 'disabled'}`}>
              {user.mfaEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">Update</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}