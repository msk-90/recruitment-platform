import User from '../models/User.js';
import Application from '../models/Application.js';

/**
 * @desc    Get any user's public profile
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      '-password -__v'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update own profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Whitelist updatable fields
    const allowed = [
      'name',
      'phone',
      'company',
      'position',
      'skills',
      'bio',
      'experience',
      'resume',
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    // Email change requires uniqueness check
    if (req.body.email && req.body.email !== user.email) {
      const existing = await User.findOne({ email: req.body.email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = req.body.email;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      company: user.company,
      position: user.position,
      skills: user.skills,
      bio: user.bio,
      experience: user.experience,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    List all candidates (recruiter view)
 * @route   GET /api/users/candidates
 * @access  Private (recruiter only)
 */
export const listCandidates = async (req, res, next) => {
  try {
    const candidates = await User.find({ role: 'candidate' })
      .select('-password -__v')
      .sort({ createdAt: -1 });

    res.json({
      count: candidates.length,
      candidates,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a candidate's full profile (recruiter view)
 * @route   GET /api/users/candidates/:id
 * @access  Private (recruiter only)
 */
export const getCandidateProfile = async (req, res, next) => {
  try {
    const candidate = await User.findOne({
      _id: req.params.id,
      role: 'candidate',
    }).select('-password -__v');

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Include their applications
    const applications = await Application.find({ candidate: candidate._id })
      .populate('job', 'title company location status')
      .sort({ createdAt: -1 });

    res.json({
      candidate,
      applications,
    });
  } catch (err) {
    next(err);
  }
};