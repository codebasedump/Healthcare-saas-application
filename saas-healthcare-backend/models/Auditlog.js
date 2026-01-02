// import mongoose from 'mongoose';

// const AuditLogSchema = new mongoose.Schema({
//   tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   action: { type: String, required: true },
//   entityType: String,
//   entityId: mongoose.Schema.Types.ObjectId,
//   timestamp: { type: Date, default: Date.now },
//   ipAddress: String
// });

// const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
// export default AuditLog;

import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
  actor: { type: String, required: true } // Ensure this field is populated
});

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
