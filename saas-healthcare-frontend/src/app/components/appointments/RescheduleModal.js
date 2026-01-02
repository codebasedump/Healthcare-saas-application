import { useEffect, useState } from 'react';
import { getRosterSlots } from '../../../services/rosterService';

const RescheduleModal = ({ appointment, onClose, onConfirm, onCancel }) => {
  const [newDate, setNewDate] = useState(() => {
    const originalDate = appointment?.date;
    return originalDate ? new Date(originalDate).toISOString().slice(0, 10) : '';
  });

  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestedDate, setSuggestedDate] = useState('');

  const doctorId =
    typeof appointment?.doctorId === 'string'
      ? appointment?.doctorId
      : appointment?.doctorId?._id;

  const doctorName = appointment?.doctorId?.name || 'Doctor';
  const location = appointment?.location || 'Clinic';

  const normalizeTime = (timeStr) => {
    const time = new Date(`1970-01-01T${timeStr.replace('.', ':').replace(/\s/g, '')}`);
    return isNaN(time) ? timeStr : time.toTimeString().slice(0, 5); // "HH:mm"
  };

  const groupSlots = (slots) => {
    const morning = [];
    const afternoon = [];
    slots.forEach((slot) => {
      const hour = parseInt(slot.split(':')[0], 10);
      if (hour < 12) morning.push(slot);
      else afternoon.push(slot);
    });
    return { morning, afternoon };
  };

  const isUrgent = (slot) => {
    const now = new Date();
    const slotTime = new Date(`${newDate}T${slot}`);
    const diff = (slotTime - now) / (1000 * 60); // minutes
    return diff > 0 && diff <= 120;
  };

  const isWeekend = (dateStr) => {
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
  };

  const fetchSlotsForDate = async (date) => {
    try {
      const res = await getRosterSlots(doctorId, date);
      return res?.data?.availableSlots || [];
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorId || !newDate) return;
      setLoading(true);
      const slots = await fetchSlotsForDate(newDate);
      setAvailableSlots(slots);
      setSuggestedDate('');

      if (slots.length === 0) {
        for (let i = 1; i <= 14; i++) {
          const nextDate = new Date(newDate);
          nextDate.setDate(nextDate.getDate() + i);
          const nextDateStr = nextDate.toISOString().slice(0, 10);
          if (isWeekend(nextDateStr)) continue;
          const nextSlots = await fetchSlotsForDate(nextDateStr);
          if (nextSlots.length > 0) {
            setSuggestedDate(nextDateStr);
            break;
          }
        }
      }

      setLoading(false);
    };
    fetchSlots();
  }, [newDate, doctorId]);

  const handleConfirm = () => {
    if (!newTime) return;
    const updatedAppt = {
      ...appointment,
      date: newDate,
      timeSlot: normalizeTime(newTime)
    };
    onConfirm(updatedAppt);
  };

  const { morning, afternoon } = groupSlots(availableSlots);

  return (
    <div className="modal-backdrop modalbox" onClick={onClose}>
      <div className="modal-box animated-entry" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">👤 Reschedule Appointment</h2>

        <div className="modal-body mt-4">
          <div className="modal-row">
            <strong>Doctor:</strong> {doctorName}
          </div>
          <div className="modal-row">
            <strong>Patient:</strong> {appointment?.patientId?.name || '—'}
          </div>

          <div className="modal-row">
            <strong>New Date:</strong>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>

          <div className="modal-row">
            <strong>Available Time:</strong>
            {loading ? (
              <p>Loading slots...</p>
            ) : availableSlots.length > 0 ? (
              <select value={newTime} onChange={(e) => setNewTime(e.target.value)}>
                <option value="">Select a time</option>
                {morning.length > 0 && (
                  <optgroup label="Morning">
                    {morning.map((slot) => (
                      <option
                        key={slot}
                        value={slot}
                        title={`Doctor: ${doctorName}, Location: ${location}`}
                        style={isUrgent(slot) ? { backgroundColor: '#ffe0e0' } : {}}
                      >
                        {slot} {isUrgent(slot) ? '⚠️ Urgent' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {afternoon.length > 0 && (
                  <optgroup label="Afternoon">
                    {afternoon.map((slot) => (
                      <option
                        key={slot}
                        value={slot}
                        title={`Doctor: ${doctorName}, Location: ${location}`}
                        style={isUrgent(slot) ? { backgroundColor: '#ffe0e0' } : {}}
                      >
                        {slot} {isUrgent(slot) ? '⚠️ Urgent' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            ) : (
              <p className="warning-text">
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

          {availableSlots.length > 0 && (
            <div className="calendar-preview mt-3">
              <strong>Calendar View:</strong>
              <div className="calendar-grid">
                {availableSlots.map((slot) => (
                  <div
                    key={slot}
                    className={`calendar-slot ${isUrgent(slot) ? 'urgent' : ''}`}
                    title={`Doctor: ${doctorName}, Location: ${location}`}
                    onClick={() => setNewTime(slot)}
                    style={{
                      padding: '6px 10px',
                      margin: '4px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: slot === newTime ? '#d0f0ff' : '#f9f9f9'
                    }}
                  >
                    {slot} {isUrgent(slot) ? '⚠️' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer mt-4 d-flex justify-content-between">
          <button className="btn btn-danger" onClick={() => onCancel(appointment._id)}>
            ❌ Cancel Appointment
          </button>
          <div>
            <button className="btn btn-secondary me-2" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-success" onClick={handleConfirm} disabled={!newTime}>
              ✅ Confirm Reschedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;