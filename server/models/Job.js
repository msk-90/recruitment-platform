import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: String,
    location: String,
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    },
    salary: String,
    skills: [String],
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

export default mongoose.model('Job', jobSchema);