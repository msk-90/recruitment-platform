import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

/**
 * @desc    Platform-wide stats
 * @route   GET /api/admin/stats
 * @access  Private (admin only)
 */
export const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalRecruiters,
      totalCandidates,
      totalAdmins,
      totalJobs,
      openJobs,
      totalApplications,
      bannedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'admin' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Application.countDocuments(),
      User.countDocuments({ banned: true }),
    ]);

    // Application pipeline breakdown
    const pipelineRaw = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const pipeline = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
    };
    pipelineRaw.forEach((p) => {
      if (pipeline[p._id] !== undefined) pipeline[p._id] = p.count;
    });

    res.json({
      users: {
        total: totalUsers,
        recruiters: totalRecruiters,
        candidates: totalCandidates,
        admins: totalAdmins,
        banned: bannedUsers,
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        closed: totalJobs - openJobs,
      },
      applications: {
        total: totalApplications,
        ...pipeline,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    List all users
 * @route   GET /api/admin/users
 * @access  Private (admin only)
 * @query   role, search, banned
 */
export const listAllUsers = async (req, res, next) => {
  try {
    const { role, search, banned } = req.query;
    const filter = {};

    if (role && ['recruiter', 'candidate', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    if (banned === 'true') filter.banned = true;
    if (banned === 'false') filter.banned = false;

    const users = await User.find(filter)
      .select('-password -__v')
      .sort({ createdAt: -1 });

    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Ban / unban a user
 * @route   PUT /api/admin/users/:id/ban
 * @access  Private (admin only)
 */
export const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent self-ban
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't ban yourself" });
    }

    // Prevent banning other admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: "Can't ban another admin" });
    }

    user.banned = !user.banned;
    await user.save();

    res.json({
      message: `User ${user.banned ? 'banned' : 'unbanned'}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        banned: user.banned,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Change a user's role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (admin only)
 */
export const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['recruiter', 'candidate', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't change your own role" });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `Role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a user + all their data
 * @route   DELETE /api/admin/users/:id
 * @access  Private (admin only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't delete yourself" });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: "Can't delete another admin" });
    }

    // Cascade: delete their jobs + applications if recruiter/candidate
    if (user.role === 'recruiter') {
      const jobs = await Job.find({ recruiter: user._id });
      const jobIds = jobs.map((j) => j._id);
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ recruiter: user._id });
    } else if (user.role === 'candidate') {
      await Application.deleteMany({ candidate: user._id });
    }

    await user.deleteOne();

    res.json({ message: 'User and their data deleted' });
  } catch (err) {
    next(err);
  }
};