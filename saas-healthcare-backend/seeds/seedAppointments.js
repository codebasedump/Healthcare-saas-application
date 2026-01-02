import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from '../models/Appointment.js';

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const defaultFields = {
  mode: 'in-person',
  notes: '',
  cancellation: {
    reason: '',
    cancelledBy: null,
    cancelledAt: null,
  },
  rescheduledFrom: null,
  auditTrailId: null,
};

const seed = async () => {
  await Appointment.create([
    {
      doctorId: new mongoose.Types.ObjectId('68dc9782c01468cf91a639fe'), // Harry Mohandass
      patientId: new mongoose.Types.ObjectId('68cd4e496200f750840f74b8'), // Lucas Martin
      tenantId: new mongoose.Types.ObjectId('68cd48e78d351c43fabbc4b2'),
      date: new Date('2025-09-20T10:30:00'),
      timeSlot: '10:30 AM',
      status: 'scheduled',
      ...defaultFields,
    },
    {
      doctorId: new mongoose.Types.ObjectId('68dc9782c01468cf91a639fe'), // Harry Mohandass
      patientId: new mongoose.Types.ObjectId('68cd4e496200f750840f74b9'), // Grace Hall
      tenantId: new mongoose.Types.ObjectId('68cd48e78d351c43fabbc4b2'),
      date: new Date('2025-09-30T12:00:00'),
      timeSlot: '12:00 PM',
      status: 'scheduled',
      ...defaultFields,
    },
    {
      doctorId: new mongoose.Types.ObjectId('68dc980ac01468cf91a63a31'), // Steffi Alphonsa
      patientId: new mongoose.Types.ObjectId('68cd4e496200f750840f74b2'), // Ava Green
      tenantId: new mongoose.Types.ObjectId('68cd48e78d351c43fabbc4b2'),
      date: new Date('2025-09-21T14:00:00'),
      timeSlot: '2:00 PM',
      status: 'scheduled',
      ...defaultFields,
    },
    {
      doctorId: new mongoose.Types.ObjectId('68dc980ac01468cf91a63a31'), // Steffi Alphonsa
      patientId: new mongoose.Types.ObjectId('68cd4e496200f750840f74b4'), // Isabella Wright
      tenantId: new mongoose.Types.ObjectId('68cd48e78d351c43fabbc4b2'),
      date: new Date('2025-10-01T08:30:00'),
      timeSlot: '8:30 AM',
      status: 'scheduled',
      ...defaultFields,
    },
    {
      doctorId: new mongoose.Types.ObjectId('68d496af25eb0ce538a431dc'), // Dr. Sunrise
      patientId: new mongoose.Types.ObjectId('68cd4e496200f750840f74b3'), // Chloe Davis
      tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335b'),
      date: new Date('2025-09-24T10:00:00'),
      timeSlot: '10:00 AM',
      status: 'scheduled',
      ...defaultFields,
    },
    {
      doctorId: new mongoose.Types.ObjectId('68d496af25eb0ce538a431dc'), // Dr. Sunrise
      patientId: new mongoose.Types.ObjectId('68cd4e496200f750840f74b5'), // Ethan Brown
      tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335b'),
      date: new Date('2025-09-25T09:00:00'),
      timeSlot: '9:00 AM',
      status: 'scheduled',
      ...defaultFields,
    },
  ]);

  console.log('✅ Appointments seeded with correct doctor-patient linkage');
  mongoose.disconnect();
};

seed();