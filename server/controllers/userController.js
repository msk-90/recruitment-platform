import User from '../models/User.js';
import Application from '../models/Application.js';

/**
 * @desc    Get any user's public profile
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
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
    if (!user) return res.status(404).json({ message: 'User not found' });

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

    if (req.body.email && req.body.email !== user.email) {
      const existing = await User.findOne({
        email: req.body.email.toLowerCase(),
      });
      if (existing) return res.status(409).json({ message: 'Email already in use' });
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
      resume: user.resume,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    List all candidates with filters
 * @route   GET /api/users/candidates
 * @access  Private (recruiter only)
 * @query   search, skill, experience, sort
 */
export const listCandidates = async (req, res, next) => {
  try {
    const { search, skill, experience, sort } = req.query;

    const filter = { role: 'candidate' };

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
      ];
    }

    if (skill) {
      filter.skills = { $in: [new RegExp(skill, 'i')] };
    }

    if (experience) {
      filter.experience = new RegExp(experience, 'i');
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const candidates = await User.find(filter)
      .select('-password -__v')
      .sort(sortOption);

    // Add application count for each candidate
    const candidatesWithStats = await Promise.all(
      candidates.map(async (c) => {
        const appsCount = await Application.countDocuments({
          candidate: c._id,
        });
        const hiredCount = await Application.countDocuments({
          candidate: c._id,
          status: 'hired',
        });
        return {
          ...c.toObject(),
          applicationsCount: appsCount,
          hiredCount,
        };
      })
    );

    res.json({
      count: candidatesWithStats.length,
      candidates: candidatesWithStats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a candidate's full profile + all their applications
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

    const applications = await Application.find({ candidate: candidate._id })
      .populate('job', 'title company location type status salary recruiter')
      .sort({ createdAt: -1 });

    res.json({
      candidate,
      applications,
      stats: {
        total: applications.length,
        shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
        interview: applications.filter((a) => a.status === 'interview').length,
        hired: applications.filter((a) => a.status === 'hired').length,
        rejected: applications.filter((a) => a.status === 'rejected').length,
      },
    });
  } catch (err) {
    next(err);
  }
};