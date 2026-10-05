import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // don't return password by default
    },
    role: {
      type: String,
      enum: ['recruiter', 'candidate'],
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      trim: true,
    },

    // Recruiter-specific
    company: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },

    // Candidate-specific
    skills: {
      type: [String],
      default: [],
    },
    resume: {
      type: String, // file path or URL
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    experience: {
      type: String, // e.g. "3 yrs"
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Virtual: applications submitted by this candidate
userSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'candidate',
});

// Virtual: jobs posted by this recruiter
userSchema.virtual('jobsPosted', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'recruiter',
});

// Pre-save: hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: compare password
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);