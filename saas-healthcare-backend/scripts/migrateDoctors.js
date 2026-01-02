import mongoose from 'mongoose';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import { syncDoctorProfile } from '../helpers/syncDoctor.js';

const migrateDoctors = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const doctors = await User.find({ role: 'doctor' });

  for (const doc of doctors) {
    await syncDoctorProfile(doc);
  }

  console.log('🎉 Doctor migration complete');
  process.exit();
};

migrateDoctors();