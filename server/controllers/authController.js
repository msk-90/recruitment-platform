import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, company, skills } = req.body;

    // Required fields
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: 'name, email, password, and role are required' });
    }

    // Role whitelist
    if (!['recruiter', 'candidate'].includes(role)) {
      return res
        .status(400)
        .json({ message: "role must be 'recruiter' or 'candidate'" });
    }

    // Check existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Build user object (only role-appropriate fields)
    const userData = { name, email, password, role, phone };
    if (role === 'recruiter') {
      userData.company = company || '';
    } else if (role === 'candidate') {
      userData.skills = Array.isArray(skills) ? skills : [];
    }

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Explicitly select password (schema has select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      company: req.user.company,
      skills: req.user.skills,
      bio: req.user.bio,
      experience: req.user.experience,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};