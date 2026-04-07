const jwt = require('jsonwebtoken');

// Auth middleware - verifies JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, username, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Admin middleware - must be used AFTER authMiddleware
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Read hierarchy lists (BHM / employees) for admin, RHM, and BHM dashboards
const hierarchyReadMiddleware = (req, res, next) => {
  const allowed = ['ADMIN', 'RHM', 'BHM'];
  if (req.user && allowed.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied.' });
};

module.exports = { authMiddleware, adminMiddleware, hierarchyReadMiddleware };