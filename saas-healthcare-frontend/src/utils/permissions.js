// utils/permissions.js
export const rolePermissions = {
  admin: ['view', 'edit', 'delete', 'audit', 'toggleStatus', 'linkPatients'],
  doctor: ['view', 'linkPatients'],
  receptionist: ['view', 'linkPatients']
};

export const can = (role, action) => rolePermissions[role]?.includes(action);