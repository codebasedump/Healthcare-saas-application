import React, { useState, useEffect } from 'react';
import { createUser, fetchRoles } from '../../../services/userService';
import { toast } from 'react-toastify';
import './UserModal.css';

export default function CreateUserModal({ show, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    status: 'active',
    department: '',
    specialty: '',
    mfaEnabled: false
  });

  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const fetchedRoles = await fetchRoles(); // returns [{ name: "admin" }, ...]
        const roleNames = fetchedRoles.map(role => role.name); // extract names
        setRoles(roleNames);
      } catch (err) {
        toast.error('❌ Failed to load roles');
      }
    };
    if (show) loadRoles();
  }, [show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
    setErrors({ ...errors, [name]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.email.trim()) newErrors.email = true;
    if (!form.password || form.password.length < 6) newErrors.password = true;
    if (!form.role) newErrors.role = true;
    if (!form.department.trim()) newErrors.department = true;
    if (form.role === 'doctor' && !form.specialty.trim()) newErrors.specialty = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('❌ Please fill all required fields correctly');
      return;
    }

    const payload = { ...form };
    if (form.role !== 'doctor') delete payload.specialty;

    try {
      await createUser(payload);
      toast.success('✅ User created successfully');
      onCreated();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('❌ Email already exists');
      } else {
        toast.error('❌ Failed to create user');
      }
    }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop modalbox">
      <div className="modal-box">
        <h2 className="modal-title">➕ Create User</h2>
        <form onSubmit={handleSubmit} className="form mt-5" noValidate>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className={errors.name ? 'input-error' : ''}
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={errors.email ? 'input-error' : ''}
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className={errors.password ? 'input-error' : ''}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className={errors.role ? 'input-error' : ''}
          >
            <option value="" disabled>-- Select Role --</option>
            {roles.map((role, index) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
                    
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">🟢 Active</option>
            <option value="suspended">🔴 Suspended</option>
          </select>

          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Department"
            className={errors.department ? 'input-error' : ''}
          />

          {form.role === 'doctor' && (
            <input
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
              placeholder="Specialty"
              className={errors.specialty ? 'input-error' : ''}
            />
          )}

          <div className="field">
            <strong>MFA:</strong>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="mfaEnabled"
                checked={form.mfaEnabled}
                onChange={handleChange}
                aria-label="Enable MFA"
              />
              <span className="slider"></span>
            </label>
            <span className={`mfa-status ${form.mfaEnabled ? 'enabled' : 'disabled'}`}>
              {form.mfaEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}