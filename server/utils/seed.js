import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

dotenv.config();

const seed = async () => {
  await connectDB();

  console.log('🧹 Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
  ]);

  console.log('👤 Creating users...');
  const recruiter = await User.create({
    name: 'Saad Khan',
    email: 'saad@techcorp.com',
    password: 'password123',
    role: 'recruiter',
    company: 'TechCorp',
    position: 'Engineering Manager',
    phone: '+92 300 1234567',
  });

  const candidate = await User.create({
    name: 'Ali Khan',
    email: 'ali@mail.com',
    password: 'password123',
    role: 'candidate',
    phone: '+92 301 2345678',
    skills: ['React', 'Node', 'Tailwind'],
    experience: '3 yrs',
    bio: 'Full-stack developer passionate about clean UI.',
  });

  console.log('💼 Creating jobs...');
  const job = await Job.create({
    recruiter: recruiter._id,
    title: 'Frontend Developer',
    description:
      'We are looking for a Frontend Developer to build modern, responsive UIs using React and Tailwind CSS.',
    company: 'TechCorp',
    location: 'Remote',
    type: 'Full-time',
    salary: '$60k–80k',
    skills: ['React', 'Tailwind', 'JavaScript'],
  });

  console.log('📄 Creating application...');
  await Application.create({
    job: job._id,
    candidate: candidate._id,
    resume: '/uploads/ali-cv.pdf',
    coverLetter: 'I am excited about this role because...',
    status: 'applied',
  });

  console.log('✅ Seed complete!');
  console.log(`   Recruiter: ${recruiter.email} / password123`);
  console.log(`   Candidate: ${candidate.email} / password123`);

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
