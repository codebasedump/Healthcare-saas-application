import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarStyles.css'; // Make sure this file includes the updated styles below

const FullCal = ({
  appointments,
  calendarHeight,
  setSelectedAppointment,
  setActiveModal,
  doctorColorMap
}) => {
  const calendarEvents = useMemo(() => {
    return appointments.map(appt => ({
      id: appt._id,
      title: `${appt.patientId?.name || 'Unknown'} with ${appt.doctorId?.name || 'Unknown'}`,
      date: appt.date,
      backgroundColor: doctorColorMap[appt.doctorId?._id] || '#007bff',
      extendedProps: {
        location: appt.location,
        status: appt.status,
        doctorName: appt.doctorId?.name,
        patientName: appt.patientId?.name,
        doctorId: appt.doctorId?._id
      }
    }));
  }, [appointments, doctorColorMap]);

  return (
    <FullCalendar
      height={calendarHeight}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      contentHeight="auto"
      editable={true}
      events={calendarEvents}
      eventDrop={(info) => {
        const appt = appointments.find(a => a._id === info.event.id);
        if (appt) {
          setSelectedAppointment({ ...appt, date: info.event.startStr });
          setActiveModal('reschedule');
        }
      }}
       validRange={{
        start: new Date().toISOString().split('T')[0] // disables all dates before today
      }}

      // eventClick={(info) => {
      //   const appt = appointments.find(a => a._id === info.event.id);
      //   setSelectedAppointment(appt);
      //   setActiveModal('reschedule');
      // }}
      eventClick={(info) => {
        const appt = appointments.find(a => a._id === info.event.id);
        setSelectedAppointment(appt);
        setActiveModal('reschedule');
      }}
      dateClick={(info) => {
        setSelectedAppointment({
          date: info.dateStr,
          doctorId: null,
          patientId: null
        });
        setActiveModal('booking');
      }}
      eventContent={(arg) => {
        const { doctorName, doctorId, patientName, status } = arg.event.extendedProps;
        const color = doctorColorMap[doctorId] || '#007bff';

        return (
          <div
            className="calendar-avatar-wrapper"
            title={`${patientName} with ${doctorName} (${status})`}
          >
            <span
              className="calendar-avatar"
              style={{ backgroundColor: color }}
            >
              {doctorName?.[0] || '?'}
            </span>
          </div>
        );
      }}
      eventDidMount={(info) => {
        const { location } = info.event.extendedProps;
        info.el.setAttribute('title', `Location: ${location}`);
      }}
    />
  );
};

export default FullCal;