// import Appointment from './models/Appointment.js';

// export default function setupSocket(io) {
//   io.on('connection', (socket) => {
//     socket.on('subscribeAdmin', (tenantId) => {
//       socket.join(`appointments:${tenantId}`);
//       console.log(`✅ Admin subscribed to appointments for tenant ${tenantId}`);
//     });

//     socket.on('disconnect', () => {
//       console.log(`🔴 Socket disconnected: ${socket.id}`);
//     });
//   });

//   try {
//     Appointment.watch().on('change', (change) => {
//       if (change.operationType === 'insert') {
//         const newAppt = change.fullDocument;
//         const tenantRoom = `appointments:${newAppt.tenantId}`;
//         io.to(tenantRoom).emit('newAppointment', newAppt);
//         console.log(`📢 New appointment emitted to ${tenantRoom}`);
//       }
//     });
//   } catch (err) {
//     console.error('❌ Error in appointment change stream:', err);
//   }
// }

import Appointment from './models/Appointment.js';

export default function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Admin subscribes to appointment updates for a specific tenant
    socket.on('subscribeAdmin', (tenantId) => {
      socket.join(`appointments:${tenantId}`);
      console.log(`✅ Admin subscribed to appointments for tenant ${tenantId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });

  // Change Streams disabled because this MongoDB tier does not support watch()
  console.log("ℹ️ Appointment Change Streams disabled (MongoDB tier does not support watch())");
}