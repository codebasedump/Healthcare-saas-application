import mongoose from 'mongoose';
import Prescription from '../models/Prescription.js';
import buildPrescriptionFilter from '../utils/buildPrescriptionFilter.js';
import { Parser } from 'json2csv';

// 📥 Get all prescriptions (admin view)
export const getAllPrescriptions = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenantId' });
    }

    const prescriptions = await Prescription.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },

      { $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },

      { $lookup: {
          from: 'patients',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient'
        }
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },

      { $lookup: {
          from: 'appointments',
          localField: 'appointmentId',
          foreignField: '_id',
          as: 'appointment'
        }
      },
      { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } },

      { $sort: { createdAt: -1 } }
    ]);

    console.log('📦 Prescriptions returned:', prescriptions.length);

    res.json({
      prescriptions,
      total: prescriptions.length
    });
  } catch (err) {
    console.error('❌ Failed to fetch prescriptions:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
};



// 🆕 Create a new prescription
export const createPrescription = async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      appointmentId,
      medications,
      notes,
      pdfUrl
    } = req.body;

    const newPrescription = new Prescription({
      tenantId: req.user.tenantId,
      doctorId: new mongoose.Types.ObjectId(doctorId),
      patientId: new mongoose.Types.ObjectId(patientId),
      appointmentId: new mongoose.Types.ObjectId(appointmentId),
      medications,
      notes,
      issuedBy: req.user._id,
      pdfUrl,
      status: 'active'
    });

    const saved = await newPrescription.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Failed to create prescription:', err);
    res.status(500).json({ error: 'Failed to create prescription' });
  }
};

// export const searchPrescriptions = async (req, res) => {
//   try {
//     const {
//       query = '',
//       page = 1,
//       limit = 5,
//       startDate,
//       endDate,
//       doctorIds,
//       patientIds
//     } = req.query;

//     const tenantId = req.user.tenantId;
//     const baseFilter = { tenantId };

//     // ✅ Normalize doctorIds and patientIds to arrays
//     let doctorIdList = [];
//     let patientIdList = [];

//     if (doctorIds) {
//       doctorIdList = Array.isArray(doctorIds)
//         ? doctorIds
//         : typeof doctorIds === 'string'
//         ? [doctorIds]
//         : [];
//     }

//     if (patientIds) {
//       patientIdList = Array.isArray(patientIds)
//         ? patientIds
//         : typeof patientIds === 'string'
//         ? [patientIds]
//         : [];
//     }

//     // ✅ Apply filters
//     if (doctorIdList.length > 0) {
//       baseFilter.doctorId = {
//         $in: doctorIdList.map((id) => new mongoose.Types.ObjectId(id))
//       };
//     }

//     if (patientIdList.length > 0) {
//       baseFilter.patientId = {
//         $in: patientIdList.map((id) => new mongoose.Types.ObjectId(id))
//       };
//     }

//     if (startDate || endDate) {
//       baseFilter.createdAt = {};
//       if (startDate) baseFilter.createdAt.$gte = new Date(startDate);
//       if (endDate) baseFilter.createdAt.$lte = new Date(endDate);
//     }

//     // ✅ Regex search
//     const regexMatch = query?.trim()
//       ? {
//           $or: [
//             { notes: { $regex: query, $options: 'i' } },
//             { status: { $regex: query, $options: 'i' } },
//             { 'medications.name': { $regex: query, $options: 'i' } },
//             { 'medications.dosage': { $regex: query, $options: 'i' } },
//             { 'medications.frequency': { $regex: query, $options: 'i' } }
//           ]
//         }
//       : null;

//     // ✅ Aggregation pipeline
//     const pipeline = [
//       { $match: baseFilter },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'doctorId',
//           foreignField: '_id',
//           as: 'doctor'
//         }
//       },
//       { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'patients',
//           localField: 'patientId',
//           foreignField: '_id',
//           as: 'patient'
//         }
//       },
//       { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'appointments',
//           localField: 'appointmentId',
//           foreignField: '_id',
//           as: 'appointment'
//         }
//       },
//       { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } },

//       // ✅ Normalize legacy fields
//       {
//         $addFields: {
//           medications: {
//             $cond: [
//               { $ifNull: ['$prescription.medication', false] },
//               [
//                 {
//                   name: '$prescription.medication',
//                   dosage: '$prescription.dosage',
//                   frequency: '$prescription.frequency'
//                 }
//               ],
//               '$medications'
//             ]
//           },
//           notes: {
//             $cond: [
//               { $ifNull: ['$prescription.notes', false] },
//               '$prescription.notes',
//               '$notes'
//             ]
//           }
//         }
//       },

//       ...(regexMatch ? [{ $match: regexMatch }] : []),
//       { $sort: { createdAt: -1 } },
//       {
//         $facet: {
//           prescriptions: [
//             { $skip: (page - 1) * parseInt(limit) },
//             { $limit: parseInt(limit) }
//           ],
//           totalCount: [{ $count: 'count' }]
//         }
//       }
//     ];

//     const result = await Prescription.aggregate(pipeline);
//     const prescriptions = result[0]?.prescriptions || [];
//     const total = result[0]?.totalCount[0]?.count || 0;

//     res.json({ prescriptions, total });
//   } catch (err) {
//     console.error('❌ Search failed:', err);
//     res.status(500).json({ error: 'Failed to search prescriptions' });
//   }
// };

// export const searchPrescriptions = async (req, res) => {
//   try {
//     const {
//       query = '',
//       page = 1,
//       limit = 5,
//       startDate,
//       endDate,
//       doctorIds,
//       patientIds
//     } = req.query;

//     const tenantId = req.user?.tenantId;
//     if (!tenantId) {
//       return res.status(400).json({ error: 'Missing tenantId' });
//     }

//     const baseFilter = { tenantId };

//     // Normalize doctorIds and patientIds
//     const doctorIdList = Array.isArray(doctorIds)
//       ? doctorIds
//       : typeof doctorIds === 'string'
//       ? [doctorIds]
//       : [];

//     const patientIdList = Array.isArray(patientIds)
//       ? patientIds
//       : typeof patientIds === 'string'
//       ? [patientIds]
//       : [];

//     if (doctorIdList.length > 0) {
//       baseFilter.doctorId = {
//         $in: doctorIdList.map(id => new mongoose.Types.ObjectId(id))
//       };
//     }

//     if (patientIdList.length > 0) {
//       baseFilter.patientId = {
//         $in: patientIdList.map(id => new mongoose.Types.ObjectId(id))
//       };
//     }

//     if (startDate || endDate) {
//       baseFilter.createdAt = {};
//       if (startDate) baseFilter.createdAt.$gte = new Date(startDate);
//       if (endDate) baseFilter.createdAt.$lte = new Date(endDate);
//     }

//     const pipeline = [
//       { $match: baseFilter },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'doctorId',
//           foreignField: '_id',
//           as: 'doctor'
//         }
//       },
//       { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'patients',
//           localField: 'patientId',
//           foreignField: '_id',
//           as: 'patient'
//         }
//       },
//       { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'appointments',
//           localField: 'appointmentId',
//           foreignField: '_id',
//           as: 'appointment'
//         }
//       },
//       { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } },
// //       {
// //   $addFields: {
// //     medications: {
// //       $cond: [
// //         { $gt: ['$prescription.medication', null] },
// //         [{
// //           name: '$prescription.medication',
// //           dosage: '$prescription.dosage',
// //           frequency: '$prescription.frequency'
// //         }],
// //         '$medications'
// //       ]
// //     },
// //     notes: {
// //       $cond: [
// //         { $gt: ['$prescription.notes', null] },
// //         '$prescription.notes',
// //         '$notes'
// //       ]
// //     }
// //   }
// // }
// // ,
//       ...(query.trim()
//         ? [{
//             $match: {
//               $or: [
//                 { notes: { $regex: query, $options: 'i' } },
//                 { status: { $regex: query, $options: 'i' } },
//                 { 'medications.name': { $regex: query, $options: 'i' } },
//                 { 'medications.dosage': { $regex: query, $options: 'i' } },
//                 { 'medications.frequency': { $regex: query, $options: 'i' } }
//               ]
//             }
//           }]
//         : []),
//       { $sort: { createdAt: -1 } },
//       {
//         $facet: {
//           prescriptions: [
//             { $skip: (page - 1) * parseInt(limit) },
//             { $limit: parseInt(limit) }
//           ],
//           totalCount: [{ $count: 'count' }]
//         }
//       }
//     ];

//     const result = await Prescription.aggregate(pipeline);
//     console.log('🧪 Aggregation result:', JSON.stringify(result, null, 2));

//     const prescriptions = result[0]?.prescriptions || [];
//     const total = result[0]?.totalCount[0]?.count || 0;

//     console.log('🔍 Final baseFilter:', baseFilter);
//     console.log('✅ Prescriptions returned:', prescriptions.length);

//     res.json({ prescriptions, total });
//   } catch (err) {
//     console.error('❌ Search failed:', err);
//     res.status(500).json({ error: 'Failed to search prescriptions' });
//   }
// };


export const searchPrescriptions = async (req, res) => {
  try {
    const {
      query = '',
      page = 1,
      limit = 5,
      startDate,
      endDate,
      doctorIds,
      patientIds
    } = req.query;

    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenantId' });
    }

    const baseFilter = { tenantId: new mongoose.Types.ObjectId(tenantId) };

    const doctorIdList = Array.isArray(doctorIds)
      ? doctorIds
      : typeof doctorIds === 'string'
      ? [doctorIds]
      : [];

    const patientIdList = Array.isArray(patientIds)
      ? patientIds
      : typeof patientIds === 'string'
      ? [patientIds]
      : [];

    if (doctorIdList.length > 0) {
      baseFilter.doctorId = {
        $in: doctorIdList.map(id => new mongoose.Types.ObjectId(id))
      };
    }

    if (patientIdList.length > 0) {
      baseFilter.patientId = {
        $in: patientIdList.map(id => new mongoose.Types.ObjectId(id))
      };
    }

    if (startDate || endDate) {
      baseFilter.createdAt = {};
      if (startDate) baseFilter.createdAt.$gte = new Date(startDate);
      if (endDate) baseFilter.createdAt.$lte = new Date(endDate);
    }

    const pipeline = [
      { $match: baseFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'patients',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient'
        }
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointmentId',
          foreignField: '_id',
          as: 'appointment'
        }
      },
      { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } },
      ...(query.trim()
        ? [{
            $match: {
              $or: [
                { notes: { $regex: query, $options: 'i' } },
                { status: { $regex: query, $options: 'i' } },
                { 'medications.name': { $regex: query, $options: 'i' } },
                { 'medications.dosage': { $regex: query, $options: 'i' } },
                { 'medications.frequency': { $regex: query, $options: 'i' } }
              ]
            }
          }]
        : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          prescriptions: [
            { $skip: (page - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ];

    const result = await Prescription.aggregate(pipeline);
    console.log('🧪 Aggregation result:', JSON.stringify(result, null, 2));

    const prescriptions = result[0]?.prescriptions || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    console.log('🔍 Final baseFilter:', baseFilter);
    console.log('✅ Prescriptions returned:', prescriptions.length);

    res.json({ prescriptions, total });
  } catch (err) {
    console.error('❌ Search failed:', err);
    res.status(500).json({ error: 'Failed to search prescriptions' });
  }
};


// 📤 Export prescriptions as CSV
export const exportPrescriptions = async (req, res) => {
  try {
    const { query = '', startDate, endDate } = req.query;
    const tenantId = req.user.tenantId;

    const baseFilter = { tenantId: new mongoose.Types.ObjectId(tenantId) };

    if (startDate || endDate) {
      baseFilter.createdAt = {};
      if (startDate) baseFilter.createdAt.$gte = new Date(startDate);
      if (endDate) baseFilter.createdAt.$lte = new Date(endDate);
    }

    let regexMatch = null;
    if (query?.trim()) {
      const safeQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(safeQuery, 'i');
      regexMatch = {
        $or: [
          { notes: { $regex: regex } },
          { status: { $regex: regex } },
          { 'doctor.name': { $regex: regex } },
          { 'patient.name': { $regex: regex } },
          { 'medications.name': { $regex: regex } },
          { 'medications.dosage': { $regex: regex } },
          { 'medications.frequency': { $regex: regex } }
        ]
      };
    }

    const pipeline = [
      { $match: baseFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'patients',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient'
        }
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointmentId',
          foreignField: '_id',
          as: 'appointment'
        }
      },
      { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } },
      ...(regexMatch ? [{ $match: regexMatch }] : [])
    ];

    const prescriptions = await Prescription.aggregate(pipeline);

    if (!prescriptions.length) {
      return res.status(200).send('No prescriptions found for the selected filters.');
    }

    const data = prescriptions.map(p => ({
      Doctor: p.doctor?.name || '',
      Patient: p.patient?.name || '',
      Appointment: p.appointment?.date
        ? new Date(p.appointment.date).toISOString().split('T')[0]
        : '',
      Medications: Array.isArray(p.medications)
        ? p.medications.map(m => `${m.name} - ${m.dosage} - ${m.frequency}`).join('; ')
        : '',
      Notes: p.notes || '',
      Status: p.status || '',
      PDF: p.pdfUrl || ''
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('prescriptions.csv');
    res.send(csv);
  } catch (err) {
    console.error('❌ Export failed:', err);
    res.status(500).json({ error: 'Failed to export prescriptions' });
  }
};

// ✏️ Update prescription
export const updatePrescription = async (req, res) => {
  try {
    const { status, notes, pdfUrl } = req.body;

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

     if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (
      req.user.role === 'doctor' &&
      (!prescription.doctorId || !prescription.doctorId.equals(req.user._id))
    ) {
      return res.status(403).json({ error: 'Access denied: not your prescription' });
    }

    prescription.status = status ?? prescription.status;
    prescription.notes = notes ?? prescription.notes;
    prescription.pdfUrl = pdfUrl ?? prescription.pdfUrl;
    prescription.updatedAt = new Date();

    await prescription.save();

    const hydrated = await Prescription.aggregate([
      { $match: { _id: prescription._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'patients',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patient'
        }
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointmentId',
          foreignField: '_id',
          as: 'appointment'
        }
      },
      { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } }
    ]);

    res.json(hydrated[0]);
  } catch (err) {
    console.error('❌ Failed to update prescription:', err);
    res.status(500).json({ error: 'Failed to update prescription' });
  }
};

export const getPrescriptionsForPatient = async (req, res) => {
  try {
    const prescriptions = await Prescription.aggregate([
      {
        $match: {
          tenantId: req.user.tenantId,
          patientId: new mongoose.Types.ObjectId(req.user.patientId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'appointments',
          localField: 'appointmentId',
          foreignField: '_id',
          as: 'appointment'
        }
      },
      { $unwind: { path: '$appointment', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(prescriptions);
  } catch (err) {
    console.error('❌ Failed to fetch patient prescriptions:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
};

export const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (
      req.user.role === 'doctor' &&
      (!prescription.doctorId || !prescription.doctorId.equals(req.user._id))
    ) {
      return res.status(403).json({ error: 'Access denied: not your prescription' });
    }

    await Prescription.deleteOne({ _id: prescription._id });
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    console.error('❌ Failed to delete prescription:', err);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
};


//getPatients
// export const getPatients = async (req, res) => {
//   try {
//     const tenantId = req.user?.tenantId;
//     if (!tenantId) {
//       return res.status(400).json({ error: 'Missing tenantId' });
//     }

//     const patients = await Patient.find({ tenantId }).select('name email dob gender');
//     res.json(patients);
//   } catch (err) {
//     console.error('❌ Failed to fetch patients:', err);
//     res.status(500).json({ error: 'Failed to fetch patients' });
//   }
// };

//getDoctors
// export const getDoctors = async (req, res) => {
//   try {
//     const tenantId = req.user?.tenantId;
//     if (!tenantId) {
//       return res.status(400).json({ error: 'Missing tenantId' });
//     }

//     const doctors = await Doctor.find({ tenantId, status: 'active' }).select(
//       'name email specialty phone registrationNumber certificateUrl'
//     );

//     res.json(doctors);
//   } catch (err) {
//     console.error('❌ Failed to fetch doctors:', err);
//     res.status(500).json({ error: 'Failed to fetch doctors' });
//   }
// };
