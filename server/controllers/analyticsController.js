import Job from '../models/Job.js';
import Application from '../models/Application.js';

/**
 * @desc    Recruiter analytics
 * @route   GET /api/analytics/recruiter
 * @access  Private (recruiter)
 * @query   days=30
 */
export const getRecruiterAnalytics = async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 180);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const recruiterId = req.user._id;

    const jobs = await Job.find({ recruiter: recruiterId }).select('_id');
    const jobIds = jobs.map((j) => j._id);

    // 1. Applications over time (daily)
    const appsPerDay = await Application.aggregate([
      {
        $match: {
          job: { $in: jobIds },
          createdAt: { $gte: since },
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

    // 2. Pipeline funnel
    const funnelRaw = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const funnel = {
      applied: 0,
      shortlisted: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
    };
    funnelRaw.forEach((f) => {
      if (funnel[f._id] !== undefined) funnel[f._id] = f.count;
    });

    // 3. Per-job breakdown
    const perJob = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: '$job',
          total: { $sum: 1 },
          hired: {
            $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Enrich perJob with job titles
    const jobDetails = await Job.find({
      _id: { $in: perJob.map((p) => p._id) },
    }).select('title');

    const jobMap = {};
    jobDetails.forEach((j) => {
      jobMap[j._id.toString()] = j.title;
    });

    const topJobs = perJob.map((p) => ({
      jobId: p._id,
      title: jobMap[p._id.toString()] || 'Deleted job',
      total: p.total,
      hired: p.hired,
      rejected: p.rejected,
    }));

    // 4. Key metrics
    const totalApplications = Object.values(funnel).reduce(
      (sum, v) => sum + v,
      0
    );
    const totalJobs = jobs.length;
    const totalHired = funnel.hired;
    const totalRejected = funnel.rejected;
    const activePipeline =
      funnel.applied + funnel.shortlisted + funnel.interview;

    const hireRate =
      totalApplications > 0
        ? ((totalHired / totalApplications) * 100).toFixed(1)
        : 0;
    const rejectionRate =
      totalApplications > 0
        ? ((totalRejected / totalApplications) * 100).toFixed(1)
        : 0;

    // 5. Average time to hire (days)
    const hiredApps = await Application.find({
      job: { $in: jobIds },
      status: 'hired',
    }).select('createdAt updatedAt');

    let avgTimeToHire = 0;
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((sum, a) => {
        const diff =
          (new Date(a.updatedAt) - new Date(a.createdAt)) /
          (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0);
      avgTimeToHire = (totalDays / hiredApps.length).toFixed(1);
    }

    res.json({
      range: { days, since },
      metrics: {
        totalJobs,
        totalApplications,
        totalHired,
        activePipeline,
        hireRate: Number(hireRate),
        rejectionRate: Number(rejectionRate),
        avgTimeToHire: Number(avgTimeToHire),
      },
      funnel,
      appsPerDay,
      topJobs,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Admin analytics — platform-wide
 * @route   GET /api/analytics/admin
 * @access  Private (admin)
 * @query   days=30
 */
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 180);
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Daily signups + applications
    const signupsPerDay = await Application.db
      .collection('users')
      .aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const appsPerDay = await Application.aggregate([
      { $match: { createdAt: { $gte: since } } },
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

    // Jobs per day
    const jobsPerDay = await Job.aggregate([
      { $match: { createdAt: { $gte: since } } },
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

    res.json({
      range: { days, since },
      signupsPerDay,
      appsPerDay,
      jobsPerDay,
    });
  } catch (err) {
    next(err);
  }
};