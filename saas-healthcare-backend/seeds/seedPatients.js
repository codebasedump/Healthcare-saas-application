const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Patient = require('../models/Patient');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const seed = async () => {
  const tenantId = new mongoose.Types.ObjectId('68cd48e78d351c43fabbc4b2');

  await Patient.create([
  // Tenant B (68cd48e78d351c43fabbc4b2)
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74b2'),
    name: 'Michael Tan',
    dob: '1988-03-15',
    gender: 'male',
    phone: '0412 345 678',
    email: 'michael.tan@tenantB.com',
    medicalHistory: ['Allergy - Dust'],
    tenantId
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74b4'),
    name: 'Noah Singh',
    dob: '1992-07-21',
    gender: 'male',
    phone: '0412 111 222',
    email: 'noah.singh@tenantB.com',
    medicalHistory: ['Seasonal Allergies'],
    tenantId
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74b8'),
    name: 'Lucas Martin',
    dob: '1989-12-05',
    gender: 'male',
    phone: '0412 333 444',
    email: 'lucas.martin@tenantB.com',
    medicalHistory: ['Migraines'],
    tenantId
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74b9'),
    name: 'Grace Hall',
    dob: '1995-06-30',
    gender: 'female',
    phone: '0412 555 666',
    email: 'grace.hall@tenantB.com',
    medicalHistory: ['Eczema'],
    tenantId
  },

  // Tenant A (68d206669ac65723cc70335a)
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74a2'),
    name: 'John Smith',
    dob: '1990-05-12',
    gender: 'male',
    phone: '0892 685 070',
    email: 'john.smith@tenantA.com',
    medicalHistory: ['Diabetes', 'Hypertension'],
    tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335a')
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74a3'),
    name: 'Emily Rose',
    dob: '1985-11-23',
    gender: 'female',
    phone: '0892 123 456',
    email: 'emily.rose@tenantA.com',
    medicalHistory: ['Asthma'],
    tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335a')
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74a4'),
    name: 'David Lee',
    dob: '1982-02-14',
    gender: 'male',
    phone: '0892 987 654',
    email: 'david.lee@tenantA.com',
    medicalHistory: ['High Cholesterol'],
    tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335a')
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74a5'),
    name: 'Priya Kumar',
    dob: '1993-08-19',
    gender: 'female',
    phone: '0892 456 789',
    email: 'priya.kumar@tenantA.com',
    medicalHistory: ['Thyroid'],
    tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335a')
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74a6'),
    name: 'Liam Chen',
    dob: '1987-04-10',
    gender: 'male',
    phone: '0892 321 654',
    email: 'liam.chen@tenantA.com',
    medicalHistory: ['Anxiety'],
    tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335a')
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74a7'),
    name: 'Sophia Patel',
    dob: '1991-09-25',
    gender: 'female',
    phone: '0892 654 321',
    email: 'sophia.patel@tenantA.com',
    medicalHistory: ['Migraines'],
    tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335a')
  },

  // Tenant C (68d206669ac65723cc70335b)
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74b3'),
    name: 'Ava Green',
    dob: '1986-03-03',
    gender: 'female',
    phone: '0412 777 888',
    email: 'ava.green@tenantC.com',
    medicalHistory: ['GERD'],
    tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335b')
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74b5'),
    name: 'Isabella Wright',
    dob: '1994-12-12',
    gender: 'female',
    phone: '0412 999 000',
    email: 'isabella.wright@tenantC.com',
    medicalHistory: ['Hypertension'],
    tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335b')
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74b6'),
    name: 'Ethan Brown',
    dob: '1983-07-07',
    gender: 'male',
    phone: '0412 888 999',
    email: 'ethan.brown@tenantC.com',
    medicalHistory: ['High Cholesterol'],
    tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335b')
  },
  {
    _id: new mongoose.Types.ObjectId('68cd4e496200f750840f74b7'),
    name: 'Chloe Davis',
    dob: '1996-01-01',
    gender: 'female',
    phone: '0412 666 777',
    email: 'chloe.davis@tenantC.com',
    medicalHistory: ['PCOS'],
    tenantId: new mongoose.Types.ObjectId('68d206669ac65723cc70335b')
  }
]);

  console.log('✅ Patients seeded');
  mongoose.disconnect();
};

seed();