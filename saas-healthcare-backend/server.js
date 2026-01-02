import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import mfaRoutes from './routes/mfa.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import logRoutes from './routes/logRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import rosterRoutes from './routes/rosterRoutes.js';
import auditTrailRoutes from './routes/auditTrailRoutes.js';
import roleRoutes from './routes/roles.js';
import setupSocket from './socketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/logs', logRoutes);
app.use('/api', auditTrailRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/roster', rosterRoutes);


// MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('✅ MongoDB connected');
// }).catch(err => {
//   console.error('❌ MongoDB error:', err.message);
// });

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    console.log('ℹ️ Change Streams disabled on this MongoDB tier');
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
  });

// Socket.IO Setup
setupSocket(io);

// Start Server
const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Gracefully shutting down...');
  await mongoose.disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});