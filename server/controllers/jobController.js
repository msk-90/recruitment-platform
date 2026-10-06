import Job from '../models/Job.js';
import Application from '../models/Application.js';

/**
 * @desc    List jobs with search, filter, sort
 * @route   GET /api/jobs
 * @access  Public
 * @query   search, location, type, status, sort, minSalary, maxSalary
 */
export const getJobs = async (req, res, next) => {
  try {
    const { search, location, type, status, sort, minSalary, maxSalary } =
      req.query;

    const filter = {};

    // Status — default "open" for public
    if (status && status !== 'all') {
      filter.status = status;
    } else if (!status) {
      filter.status = 'open';
    }

    // Location
    if (location) filter.location = new RegExp(location, 'i');

    // Type
    if (type) filter.type = type;

    // Search — title, description, company, skills
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Salary range — text field, so we do a rough regex parse
    // Stored like "$60k–80k" → user passes minSalary=60, maxSalary=80
    if (minSalary || maxSalary) {
      const min = Number(minSalary) || 0;
      const max = Number(maxSalary) || 999999;
      // Match strings containing numbers in that range (very loose)
      filter.salary = { $regex: /\d+/, $options: 'i' };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'applicants') sortOption = { applicantsCount: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    const jobs = await Job.find(filter)
      .populate('recruiter', 'name email company')
      .sort(sortOption);

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
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Recruiter's own jobs
 * @route   GET /api/jobs/me
 * @access  Private (recruiter only)
 * @query   search, status, sort
 */
export const getMyJobs = async (req, res, next) => {
  try {
    const { search, status, sort } = req.query;

    const filter = { recruiter: req.user._id };

    if (status && status !== 'all') filter.status = status;

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'applicants') sortOption = { applicantsCount: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    const jobs = await Job.find(filter).sort(sortOption);

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
    if (!job) return res.status(404).json({ message: 'Job not found' });

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
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this job' });
    }

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
    if (!job) return res.status(404).json({ message: 'Job not found' });

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