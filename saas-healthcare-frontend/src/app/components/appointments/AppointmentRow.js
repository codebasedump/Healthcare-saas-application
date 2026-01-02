import React from 'react';
import './AppointmentRow.css';
import { format } from 'date-fns';

export default function AppointmentRow({ appt }) {
  const {
    doctorId,
    patientId,
    date,
    timeSlot,
    status,
    mode,
    notes,
    createdAt,
    cancellation
  } = appt;

  // ✅ Map status to badge class
  const statusClass = {
    scheduled: 'status-scheduled',
    cancelled: 'status-cancelled',
    completed: 'status-completed',
    expired: 'status-expired'
  }[status] || 'status-default';

  // ✅ Optional: Tooltip for cancellation timestamp
  const cancellationTooltip =
    status === 'cancelled' && cancellation?.createdAt
      ? `Cancelled on ${format(new Date(cancellation.createdAt), 'dd/MM/yyyy HH:mm')}`
      : '';

  return (
    <tr title={`Click for details on ${doctorId?.name} & ${patientId?.name}`}>
      <td>{doctorId?.name || '—'}</td>
      <td>{patientId?.name || '—'}</td>
      <td>{format(new Date(date), 'dd/MM/yyyy')}</td>
      <td>{timeSlot}</td>
      <td>
        <span
          className={`status-badge ${statusClass}`}
          title={cancellationTooltip}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>
      <td>{mode}</td>
      <td>{notes || '—'}</td>
      <td>{format(new Date(createdAt), 'dd/MM/yyyy HH:mm')}</td>
    </tr>
  );
}