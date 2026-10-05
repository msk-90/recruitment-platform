import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job is required'],
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate is required'],
    },
    resume: {
      type: String,
      required: [true, 'Resume is required'],
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview', 'hired', 'rejected'],
      default: 'applied',
    },
    notes: {
      type: String, // recruiter's private notes
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications (same candidate + same job)
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// Fast queries
applicationSchema.index({ candidate: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

export default mongoose.model('Application', applicationSchema);