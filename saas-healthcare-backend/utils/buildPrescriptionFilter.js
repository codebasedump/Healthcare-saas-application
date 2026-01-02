function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const buildPrescriptionFilter = ({ tenantId, query, startDate, endDate }) => {
  const baseFilter = { tenantId };

  if (startDate || endDate) {
    baseFilter.createdAt = {};
    if (startDate) baseFilter.createdAt.$gte = new Date(startDate);
    if (endDate) baseFilter.createdAt.$lte = new Date(endDate);
  }

  let regexMatch = null;

  if (query?.trim()) {
    const safeQuery = escapeRegex(query.trim());
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

  return { baseFilter, regexMatch };
};

export default buildPrescriptionFilter;