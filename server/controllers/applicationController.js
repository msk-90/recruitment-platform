import Application from '../models/Application.js';
import Job from '../models/Job.js';

/**
 * @desc    Apply to a job
 * @route   POST /api/applications
 * @access  Private (candidate only)
 */
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, resume, coverLetter } = req.body;

    if (!jobId || !resume) {
      return res
        .status(400)
        .json({ message: 'jobId and resume are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res
        .status(400)
        .json({ message: 'This job is closed for applications' });
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'You have already applied to this job' });
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      resume,
      coverLetter,
    });

    // Increment applicants count
    job.applicantsCount += 1;
    await job.save();

    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'You have already applied to this job' });
    }
    next(err);
  }
};

/**
 * @desc    Candidate: my applications
 * @route   GET /api/applications/me
 * @access  Private (candidate only)
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({
      candidate: req.user._id,
    })
      .populate('job', 'title company location type status salary')
      .sort({ createdAt: -1 });

    res.json({ count: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Recruiter: applications for a specific job
 * @route   GET /api/applications/job/:jobId
 * @access  Private (recruiter, owner only)
 */
export const getApplicationsForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job: job._id })
      .populate('candidate', 'name email phone skills experience resume bio')
      .sort({ createdAt: -1 });

    res.json({ count: applications.length, applications });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single application
 * @route   GET /api/applications/:id
 * @access  Private (candidate owner OR recruiter of the job)
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company recruiter')
      .populate('candidate', 'name email phone skills experience resume bio');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const isOwnerCandidate =
      application.candidate._id.toString() === req.user._id.toString();
    const isJobRecruiter =
      application.job.recruiter.toString() === req.user._id.toString();

    if (!isOwnerCandidate && !isJobRecruiter) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(application);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Recruiter: update application status
 * @route   PUT /api/applications/:id/status
 * @access  Private (recruiter, owner of the job only)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const validStatuses = [
      'applied',
      'shortlisted',
      'interview',
      'hired',
      'rejected',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id).populate(
      'job',
      'recruiter title'
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    if (notes !== undefined) application.notes = notes;
    await application.save();

    res.json(application);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Candidate: withdraw own application
 * @route   DELETE /api/applications/:id
 * @access  Private (candidate, owner only)
 */
export const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.candidate.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: 'Not authorized to withdraw this application' });
    }

    // Decrement the job's applicants count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicantsCount: -1 },
    });

    await application.deleteOne();

    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    next(err);
  }
};