// seedRoles.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../models/Role.js'; // adjust path if needed

dotenv.config();

const roles = [
  { name: 'admin', description: 'Full access to all features' },
  { name: 'receptionist', description: 'Manages appointments and front desk' },
  { name: 'doctor', description: 'Handles patient care and medical records' }
];

const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existing = await Role.find({});
    if (existing.length > 0) {
      console.log('⚠️ Roles already exist. Skipping seeding.');
    } else {
      await Role.insertMany(roles);
      console.log('✅ Roles seeded successfully');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Failed to seed roles:', error);
    process.exit(1);
  }
};

seedRoles();