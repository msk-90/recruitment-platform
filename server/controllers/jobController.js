import Job from '../models/Job.js';
import Application from '../models/Application.js';

/**
 * @desc    List all open jobs (public)
 * @route   GET /api/jobs
 * @access  Public
 */
export const getJobs = async (req, res, next) => {
  try {
    const { search, location, type, status } = req.query;
    const filter = {};

    // Default: only open jobs for public listing
    // Recruiters can pass ?status=all to see everything
    if (status && status !== 'all') {
      filter.status = status;
    } else if (!status) {
      filter.status = 'open';
    }

    if (location) filter.location = new RegExp(location, 'i');
    if (type) filter.type = type;

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('recruiter', 'name email company')
      .sort({ createdAt: -1 });

    res.json({ count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single job
 * @route   GET /api/jobs/:id
 * @access  Public
 */
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'recruiter',
      'name email company position'
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Recruiter's own jobs
 * @route   GET /api/jobs/me
 * @access  Private (recruiter only)
 */
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a job
 * @route   POST /api/jobs
 * @access  Private (recruiter only)
 */
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      company,
      location,
      type,
      salary,
      skills,
    } = req.body;

    if (!title || !description || !location || !type) {
      return res.status(400).json({
        message: 'title, description, location, and type are required',
      });
    }

    const job = await Job.create({
      recruiter: req.user._id,
      title,
      description,
      company: company || req.user.company || '',
      location,
      type,
      salary,
      skills: Array.isArray(skills) ? skills : [],
    });

    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update own job
 * @route   PUT /api/jobs/:id
 * @access  Private (recruiter, owner only)
 */
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ownership check
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to edit this job' });
    }

    const allowed = [
      'title',
      'description',
      'company',
      'location',
      'type',
      'salary',
      'skills',
      'status',
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();

    res.json(job);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete own job (+ cascade delete its applications)
 * @route   DELETE /api/jobs/:id
 * @access  Private (recruiter, owner only)
 */
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this job' });
    }

    // Cascade delete applications
    await Application.deleteMany({ job: job._id });

    await job.deleteOne();

    res.json({ message: 'Job and its applications deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    List applicants for a job
 * @route   GET /api/jobs/:id/applicants
 * @access  Private (recruiter, owner only)
 */
export const getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view applicants for this job' });
    }

    const applications = await Application.find({ job: job._id })
      .populate('candidate', 'name email phone skills experience resume bio')
      .sort({ createdAt: -1 });

    res.json({
      job: {
        _id: job._id,
        title: job.title,
        status: job.status,
        applicantsCount: job.applicantsCount,
      },
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};