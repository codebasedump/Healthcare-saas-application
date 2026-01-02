// controllers/roleController.js
import Role from '../models/Role.js';

export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({}, 'name'); // Only return role names
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};