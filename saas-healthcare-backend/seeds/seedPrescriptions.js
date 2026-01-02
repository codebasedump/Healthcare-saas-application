import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Prescription from '../models/Prescription.js'; 

// your seeding logic here
dotenv.config();
mongoose.connect(process.env.MONGO_URI);
const ObjectId = mongoose.Types.ObjectId; 
const seed = async () => {
  const prescriptions = [
  // Tenant A - Harry Mohandass
  {
    tenantId: new ObjectId('68d206669ac65723cc70335a'),
    doctorId: new ObjectId('68d229af5809aea3c6dc8957'),
    patientId: new ObjectId('68cd4e496200f750840f74a2'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35de6'),
    medications: [
      { name: 'Paracetamol', dosage: '500mg', frequency: '2x/day' },
      { name: 'Amoxicillin', dosage: '250mg', frequency: '3x/day' }
    ],
    notes: 'Take after meals. Avoid alcohol.',
    status: 'active',
    issuedBy: new ObjectId('68d229af5809aea3c6dc8957'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantA-harry-001.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: new ObjectId('68d206669ac65723cc70335a'),
    doctorId: new ObjectId('68d229af5809aea3c6dc8957'),
    patientId: new ObjectId('68cd4e496200f750840f74a5'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35de9'),
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: '1x/day' }
    ],
    notes: 'Monitor blood pressure. Avoid potassium supplements.',
    status: 'active',
    issuedBy: new ObjectId('68d229af5809aea3c6dc8957'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantA-harry-002.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Tenant A - Steffi
  {
    tenantId: new ObjectId('68d206669ac65723cc70335a'),
    doctorId: new ObjectId('68d229ed5809aea3c6dc8972'),
    patientId: new ObjectId('68cd4e496200f750840f74a3'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35de7'),
    medications: [
      { name: 'Ibuprofen', dosage: '400mg', frequency: '1x/day' }
    ],
    notes: 'Take with food. Monitor for stomach pain.',
    status: 'cancelled',
    issuedBy: new ObjectId('68d229ed5809aea3c6dc8972'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantA-steffi-002.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: new ObjectId('68d206669ac65723cc70335a'),
    doctorId: new ObjectId('68d229ed5809aea3c6dc8972'),
    patientId: new ObjectId('68cd4e496200f750840f74a6'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35dea'),
    medications: [
      { name: 'Levothyroxine', dosage: '75mcg', frequency: '1x/day' }
    ],
    notes: 'Take on empty stomach. Avoid calcium supplements.',
    status: 'active',
    issuedBy: new ObjectId('68d229ed5809aea3c6dc8972'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantA-steffi-003.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Tenant A - Mohandass
  {
    tenantId: new ObjectId('68d206669ac65723cc70335a'),
    doctorId: new ObjectId('68d229fc5809aea3c6dc898e'),
    patientId: new ObjectId('68cd4e496200f750840f74a4'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35de8'),
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: '2x/day' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: '1x/day' }
    ],
    notes: 'Monitor blood sugar. Take statin at night.',
    status: 'expired',
    issuedBy: new ObjectId('68d229fc5809aea3c6dc898e'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantA-mohandass-003.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: new ObjectId('68d206669ac65723cc70335a'),
    doctorId: new ObjectId('68d229fc5809aea3c6dc898e'),
    patientId: new ObjectId('68cd4e496200f750840f74a7'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35deb'),
    medications: [
      { name: 'Amlodipine', dosage: '5mg', frequency: '1x/day' }
    ],
    notes: 'May cause dizziness. Take at same time daily.',
    status: 'active',
    issuedBy: new ObjectId('68d229fc5809aea3c6dc898e'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantA-mohandass-004.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Tenant B - Harry @ Hoffstee
  {
    tenantId: new ObjectId('68cd48e78d351c43fabbc4b2'),
    doctorId: new ObjectId('68d358b7cb1f9c34f984ceb8'),
    patientId: new ObjectId('68cd4e496200f750840f74b2'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35df0'),
    medications: [
      { name: 'Cetirizine', dosage: '10mg', frequency: '1x/day' }
    ],
    notes: 'Take before bedtime. Avoid driving.',
    status: 'active',
    issuedBy: new ObjectId('68d358b7cb1f9c34f984ceb8'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantB-harry-001.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: new ObjectId('68cd48e78d351c43fabbc4b2'),
    doctorId: new ObjectId('68d358b7cb1f9c34f984ceb8'),
    patientId: new ObjectId('68cd4e496200f750840f74b4'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35df2'),
    medications: [
      { name: 'Montelukast', dosage: '10mg', frequency: '1x/day' }
    ],
    notes: 'Take in evening. May cause vivid dreams.',
    status: 'active',
    issuedBy: new ObjectId('68d358b7cb1f9c34f984ceb8'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantB-harry-002.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Tenant C - Dr. Sunrise
  {
    tenantId: new ObjectId('68d206669ac65723cc70335b'),
    doctorId: new ObjectId('68d21eea3fe8f06d73298d0b'),
    patientId: new ObjectId('68cd4e496200f750840f74b3'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35df1'),
    medications: [
      { name: 'Omeprazole', dosage: '20mg', frequency: '1x/day' }
    ],
    notes: 'Take before breakfast. Avoid spicy food.',
    status: 'active',
    issuedBy: new ObjectId('68d21eea3fe8f06d73298d0b'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantC-sunrise-001.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },
    {
    tenantId: new ObjectId('68d206669ac65723cc70335b'),
    doctorId: new ObjectId('68d21eea3fe8f06d73298d0b'),
    patientId: new ObjectId('68cd4e496200f750840f74b5'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35df3'),
    medications: [
      { name: 'Losartan', dosage: '50mg', frequency: '1x/day' }
    ],
    notes: 'Take in morning. Monitor for dizziness.',
    status: 'active',
    issuedBy: new ObjectId('68d21eea3fe8f06d73298d0b'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantC-sunrise-002.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: new ObjectId('68d206669ac65723cc70335b'),
    doctorId: new ObjectId('68d21eea3fe8f06d73298d0b'),
    patientId: new ObjectId('68cd4e496200f750840f74b6'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35df4'),
    medications: [
      { name: 'Simvastatin', dosage: '40mg', frequency: '1x/day' }
    ],
    notes: 'Take at night. Avoid grapefruit.',
    status: 'expired',
    issuedBy: new ObjectId('68d21eea3fe8f06d73298d0b'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantC-sunrise-003.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: new ObjectId('68d206669ac65723cc70335b'),
    doctorId: new ObjectId('68d21eea3fe8f06d73298d0b'),
    patientId: new ObjectId('68cd4e496200f750840f74b7'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35df5'),
    medications: [
      { name: 'Hydrochlorothiazide', dosage: '25mg', frequency: '1x/day' }
    ],
    notes: 'Take in morning. May increase urination.',
    status: 'active',
    issuedBy: new ObjectId('68d21eea3fe8f06d73298d0b'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantC-sunrise-004.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: new ObjectId('68cd48e78d351c43fabbc4b2'),
    doctorId: new ObjectId('68d358b7cb1f9c34f984ceb8'),
    patientId: new ObjectId('68cd4e496200f750840f74b8'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35df6'),
    medications: [
      { name: 'Fexofenadine', dosage: '180mg', frequency: '1x/day' }
    ],
    notes: 'Non-drowsy antihistamine. Take with water.',
    status: 'active',
    issuedBy: new ObjectId('68d358b7cb1f9c34f984ceb8'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantB-harry-003.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: new ObjectId('68cd48e78d351c43fabbc4b2'),
    doctorId: new ObjectId('68d358b7cb1f9c34f984ceb8'),
    patientId: new ObjectId('68cd4e496200f750840f74b9'),
    appointmentId: new ObjectId('68cd5454a5bf2782d5c35df7'),
    medications: [
      { name: 'Doxycycline', dosage: '100mg', frequency: '2x/day' }
    ],
    notes: 'Avoid sunlight. Take with full glass of water.',
    status: 'cancelled',
    issuedBy: new ObjectId('68d358b7cb1f9c34f984ceb8'),
    pdfUrl: 'https://cdn.hoffstee.com/prescriptions/tenantB-harry-004.pdf',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

  await Prescription.deleteMany(); // optional: clean slate
  await Prescription.insertMany(prescriptions);

  console.log('✅ Multi-tenant prescriptions seeded with real doctor references');
  mongoose.disconnect();
};

seed();