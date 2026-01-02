import React, { useState, useEffect } from 'react';
import { bookAppointment } from '../../../services/appointmentService';
import { getRosterSlots } from '../../../services/rosterService';

import './BookingModal.css';
import { toast } from 'react-toastify';

export default function BookingModal({
  appointment,
  appointments,
  onClose,
  onBooked,
  doctorOptions,
  patientOptions,
  currentUser
}) {
  const [form, setForm] = useState({
    doctorId: appointment?.doctorId || '',
    patientId: appointment?.patientId || '',
    date: appointment?.date || '',
    timeSlot: '',
    mode: 'in-person',
    notes: ''
  });

  const [filteredPatients, setFilteredPatients] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [suggestedDate, setSuggestedDate] = useState('');

  useEffect(() => {
    if (!form.doctorId) {
      setFilteredPatients([]);
      return;
    }

    const selectedDoctor = doctorOptions.find(d => d._id === form.doctorId);
    const linkedIds = selectedDoctor?.linkedPatients || [];

    const linkedPatients = patientOptions.filter(p =>
      linkedIds.includes(p._id) ||
      p.registeredDoctor === form.doctorId ||
      p.registeredDoctor?._id === form.doctorId
    );

    // Prevent unnecessary re-renders
    if (JSON.stringify(filteredPatients) !== JSON.stringify(linkedPatients)) {
      setFilteredPatients(linkedPatients);
    }
  }, [form.doctorId, doctorOptions, patientOptions]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    async function fetchSlots() {
      if (!form.doctorId || !form.date) return;

      setLoadingSlots(true);
      setSuggestedDate('');

      try {
        const res = await getRosterSlots(form.doctorId, form.date);
        const slots = res?.data?.availableSlots || [];
        setAvailableSlots(slots);

        // If no slots, search next 14 days
        if (slots.length === 0) {
          for (let i = 1; i <= 14; i++) {
            const nextDate = new Date(form.date);
            nextDate.setDate(nextDate.getDate() + i);
            const nextDateStr = nextDate.toISOString().slice(0, 10);

            const day = new Date(nextDateStr).getDay();
            if (day === 0 || day === 6) continue; // skip weekends

            const nextRes = await getRosterSlots(form.doctorId, nextDateStr);
            const nextSlots = nextRes?.data?.availableSlots || [];

            if (nextSlots.length > 0) {
              setSuggestedDate(nextDateStr);
              break;
            }
          }
        }
      } catch (err) {
        console.error('❌ Failed to fetch roster slots:', err);
        setAvailableSlots([]);
      }

      setLoadingSlots(false);
    }

    fetchSlots();
  }, [form.doctorId, form.date]);

  const handleSubmit = async () => {
    const { doctorId, patientId, date, timeSlot } = form;

    if (!doctorId || !patientId || !date || !timeSlot) {
      toast.warning('Please fill all required fields');
      return;
    }

    try {
      const res = await bookAppointment({
        ...form,
        createdBy: currentUser._id
      });
      onBooked(res.data);
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error('Failed to book appointment');
    }
  };

  if (!patientOptions || !doctorOptions) return null;

  return (
    <div className="modal-backdrop modalbox" onClick={onClose}>
      <div className="modal-box animated-entry" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">📅 Book Appointment</h2>

        <div className="modal-body mt-5">
          {/* Doctor Selection */}
          <div className="form-group mb-3">
            <label>Doctor</label>
            <select
              className="form-control"
              value={form.doctorId}
              onChange={e => handleChange('doctorId', e.target.value)}
            >
              <option value="">Select Doctor</option>
              {doctorOptions.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Selection */}
          <div className="form-group mb-3">
            <label>Patient</label>
            <select
              className="form-control"
              value={form.patientId}
              onChange={e => handleChange('patientId', e.target.value)}
            >
              <option value="">Select Patient</option>
              {filteredPatients.length > 0 ? (
                filteredPatients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.email})
                  </option>
                ))
              ) : (
                patientOptions
                  .filter(p => {
                    const allLinkedIds = doctorOptions.flatMap(d => d.linkedPatients || []);
                    return !allLinkedIds.includes(p._id);
                  })
                  .map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.email}) (External)
                    </option>
                  ))
              )}
            </select>
          </div>

          {/* Date */}
          <div className="form-group mb-3">
            <label>Date</label>
            <input
              type="date"
              className="form-control"
              value={form.date}
              onChange={e => handleChange('date', e.target.value)}
            />
          </div>

          {/* Time Slot */}
          <div className="form-group mb-3">
            <label>Time Slot</label>
            {/* <input
              type="text"
              className="form-control"
              placeholder="e.g. 10:30 AM"
              value={form.timeSlot}
              onChange={e => handleChange('timeSlot', e.target.value)}
            /> */}
            
                {loadingSlots ? (
                  <p>Loading available time slots…</p>
                ) : availableSlots.length > 0 ? (
                  <select
                    className="form-control"
                    value={form.timeSlot}
                    onChange={e => handleChange('timeSlot', e.target.value)}
                  >
                    <option value="">Select a time</option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-warning">
                    ⚠️ No available slots for this doctor on selected date.
                    {suggestedDate && (
                      <span>
                        <br />
                        👉 Next available date: <strong>{suggestedDate}</strong>
                      </span>
                    )}
                  </p>
                )}
          </div>
          

          {/* Mode */}
          <div className="form-group mb-3">
            <label>Mode</label>
            <select
              className="form-control"
              value={form.mode}
              onChange={e => handleChange('mode', e.target.value)}
            >
              <option value="in-person">In-Person</option>
              <option value="telehealth">Telehealth</option>
            </select>
          </div>

          {/* Notes */}
          <div className="form-group mb-3">
            <label>Notes</label>
            <textarea
              className="form-control"
              rows="3"
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer mt-4 d-flex justify-content-end">
          <button className="btn btn-secondary me-2" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}