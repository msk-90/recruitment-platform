import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter is required'],
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: 20,
    },
    company: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      required: [true, 'Job type is required'],
    },
    salary: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
jobSchema.index({ recruiter: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text' }); // full-text search

export default mongoose.model('Job', jobSchema);