import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verify JWT and attach user to req.user.
 * Also blocks banned users.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      if (req.user.banned) {
        return res
          .status(403)
          .json({ message: 'Your account has been suspended' });
      }

      return next();
    } catch (err) {
      return res
        .status(401)
        .json({ message: 'Not authorized - invalid token' });
    }
  }

  return res
    .status(401)
    .json({ message: 'Not authorized - no token provided' });
};

/**
 * Role-based access.
 * Usage: authorize('recruiter') or authorize('recruiter', 'admin')
 * Must be used AFTER protect.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not allowed to access this resource`,
      });
    }
    next();
  };
};