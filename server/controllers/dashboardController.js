import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

/**
 * @desc    Recruiter dashboard stats
 * @route   GET /api/dashboard/recruiter
 * @access  Private (recruiter only)
 */
export const getRecruiterDashboard = async (req, res, next) => {
  try {
    const recruiterId = req.user._id;

    // 1) Total jobs posted by this recruiter
    const totalJobs = await Job.countDocuments({ recruiter: recruiterId });
    const openJobs = await Job.countDocuments({
      recruiter: recruiterId,
      status: 'open',
    });

    // 2) Get all job IDs for this recruiter
    const jobs = await Job.find({ recruiter: recruiterId }).select('_id');
    const jobIds = jobs.map((j) => j._id);

    // 3) Total applications for those jobs
    const totalApplications = await Application.countDocuments({
      job: { $in: jobIds },
    });

    // 4) Status breakdown
    const statusCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const pipeline = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
    };
    statusCounts.forEach((s) => {
      if (pipeline[s._id] !== undefined) pipeline[s._id] = s.count;
    });

    // 5) Total unique candidates who applied
    const uniqueCandidates = await Application.distinct('candidate', {
      job: { $in: jobIds },
    });

    // 6) Applications over last 30 days (for line chart)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const appsPerDay = await Application.aggregate([
      {
        $match: {
          job: { $in: jobIds },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 7) Recent 5 applications
    const recentApplications = await Application.find({
      job: { $in: jobIds },
    })
      .populate('candidate', 'name email skills experience')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalJobs,
        openJobs,
        totalApplications,
        uniqueCandidates: uniqueCandidates.length,
        hired: pipeline.hired,
        shortlisted: pipeline.shortlisted,
      },
      pipeline,
      appsPerDay,
      recentApplications,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Candidate dashboard stats
 * @route   GET /api/dashboard/candidate
 * @access  Private (candidate only)
 */
export const getCandidateDashboard = async (req, res, next) => {
  try {
    const candidateId = req.user._id;

    const totalApplications = await Application.countDocuments({
      candidate: candidateId,
    });

    const statusCounts = await Application.aggregate([
      { $match: { candidate: candidateId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const pipeline = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
    };
    statusCounts.forEach((s) => {
      if (pipeline[s._id] !== undefined) pipeline[s._id] = s.count;
    });

    const recentApplications = await Application.find({
      candidate: candidateId,
    })
      .populate('job', 'title company location status')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalApplications,
        shortlisted: pipeline.shortlisted,
        interview: pipeline.interview,
        hired: pipeline.hired,
      },
      pipeline,
      recentApplications,
    });
  } catch (err) {
    next(err);
  }
};