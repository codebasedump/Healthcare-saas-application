import React, { useEffect, useState } from 'react';
import { getActiveStaff } from '../../../services/userService';
import { bulkCreateRosters } from '../../../services/rosterService';
import './RosterForm.css';

export default function RosterForm({ onClose }) {
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    staffId: '',
    role: '',
    department: '',
    date: '',
    startTime: '',
    endTime: '',
    shiftType: '',
    location: '',
    status: 'active',
    tags: '',
    notes: '',
    repeatDays: 14 // default to fortnight
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      const staff = await getActiveStaff();
      setStaffList(staff.data || staff);
    };
    fetchStaff();
  }, []);

  useEffect(() => {
    const selected = staffList.find(s => s._id === formData.staffId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        role: selected.role || '',
        department: selected.department || selected.specialty || ''
      }));
    }
  }, [formData.staffId, staffList]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const payload = { ...formData, tags };
      await bulkCreateRosters(payload); // backend handles repeat logic
      alert('Fortnight roster created successfully');
      onClose();
    } catch (err) {
      console.error('Error creating roster:', err);
      alert('Failed to create roster');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="roster-form" onSubmit={handleSubmit}>
      <h3>Create Fortnight Roster</h3>

      <label>Staff</label>
      <select name="staffId" onChange={handleChange} required>
        <option value="">Select Staff</option>
        {staffList.map(staff => (
          <option key={staff._id} value={staff._id}>
            {staff.name} ({staff.role})
          </option>
        ))}
      </select>

      <label>Role</label>
      <input type="text" name="role" value={formData.role} readOnly />

      <label>Department</label>
      <input type="text" name="department" value={formData.department} readOnly />

      <label>Start Date</label>
      <input type="date" name="date" value={formData.date} onChange={handleChange} required />

      <label>Start Time</label>
      <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />

      <label>End Time</label>
      <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />

      <label>Shift Type</label>
      <select name="shiftType" value={formData.shiftType} onChange={handleChange} required>
        <option value="">Select Shift</option>
        <option value="morning">Morning</option>
        <option value="evening">Evening</option>
        <option value="night">Night</option>
        <option value="on-call">On-call</option>
      </select>

      <label>Location</label>
      <input type="text" name="location" value={formData.location} onChange={handleChange} required />

      <label>Status</label>
      <select name="status" value={formData.status} onChange={handleChange}>
        <option value="active">Active</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <label>Tags (comma-separated)</label>
      <input type="text" name="tags" value={formData.tags} onChange={handleChange} />

      <label>Notes</label>
      <textarea name="notes" value={formData.notes} onChange={handleChange} />

      <label>Repeat Days</label>
      <select name="repeatDays" value={formData.repeatDays} onChange={handleChange}>
        <option value="1">Single Day</option>
        <option value="7">1 Week</option>
        <option value="14">Fortnight</option>
      </select>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Roster'}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}