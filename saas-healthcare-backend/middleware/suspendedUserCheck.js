const suspendedUserCheck = (req, res, next) => {
  if (req.user?.status === 'suspended') {
    return res.status(403).json({ error: 'User account suspended' });
  }
  next();
};

export default suspendedUserCheck;