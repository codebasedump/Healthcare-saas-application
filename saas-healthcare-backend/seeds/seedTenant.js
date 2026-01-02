// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const Tenant = require('../models/Tenant');

// dotenv.config();
// mongoose.connect(process.env.MONGO_URI);

// const seed = async () => {
//   const tenants = [
//     {
//       _id: new mongoose.Types.ObjectId('68cd48e78d351c43fabbc4b2'),
//       name: 'Hoffstee Medical',
//       email: 'admin@hoffstee.com',
//       phone: '0457 123 456',
//       address: 'Leeton, NSW',
//       logo: 'hoffstee-logo.png'
//     },
//     {
//       name: 'Riverina Health',
//       email: 'admin@riverina.com',
//       phone: '0457 999 888',
//       address: 'Wagga Wagga, NSW',
//       logo: 'riverina-logo.png'
//     },
//     {
//       name: 'Sunrise Hospital',
//       email: 'admin@sunrisehospital.com',
//       phone: '0457 888 777',
//       address: 'Griffith, NSW',
//       logo: 'sunrise-logo.png'
//     }
//   ];

//   await Tenant.insertMany(tenants);
//   console.log('✅ Tenants seeded successfully');
//   mongoose.disconnect();
// };

// seed();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const seed = async () => {
  const tenants = [
    {
      _id: new mongoose.Types.ObjectId('68cd48e78d351c43fabbc4b2'),
      name: 'Hoffstee Medical',
      email: 'admin@hoffstee.com',
      phone: '0457 123 456',
      address: 'Leeton, NSW',
      logo: 'hoffstee-logo.png',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('68d206669ac65723cc70335a'),
      name: 'Riverina Health',
      email: 'admin@riverina.com',
      phone: '0457 999 888',
      address: 'Wagga Wagga, NSW',
      logo: 'riverina-logo.png',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('68d206669ac65723cc70335b'),
      name: 'Sunrise Hospital',
      email: 'admin@sunrisehospital.com',
      phone: '0457 888 777',
      address: 'Griffith, NSW',
      logo: 'sunrise-logo.png',
      status: 'active',
      createdAt: new Date()
    }
  ];

  await Tenant.insertMany(tenants);
  console.log('✅ Tenants seeded successfully');

  const hashedPassword = await bcrypt.hash('Secure#123', 12);

  const admins = tenants.map((tenant) => ({
    name: `${tenant.name} Admin`,
    email: tenant.email,
    password: hashedPassword,
    role: 'admin',
    tenantId: tenant._id,
    phone: tenant.phone,
    mfaEnabled: true,
    isActive: true,
    status: 'active',
    auditTrail: [{
      action: 'Admin seeded',
      actor: 'system',
      timestamp: new Date()
    }]
  }));

  await User.insertMany(admins);
  console.log('✅ Admin users seeded successfully');

  mongoose.disconnect();
};

seed();