import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

dotenv.config();

const seed = async () => {
  try {
    // 1. Connect first
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    // 2. Verify connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }
    console.log('✅ MongoDB ready\n');

    // 3. Clear old data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
    ]);
    console.log('   Done\n');

    // 4. Create users — ALL inside seed(), AFTER connect
    console.log('👤 Creating users...');

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@hirehub.com',
      password: 'admin123',
      role: 'admin',
      phone: '+92 300 0000000',
    });
    console.log('   ✓ Admin created');

    const recruiter = await User.create({
      name: 'Saad Khan',
      email: 'saad@techcorp.com',
      password: 'password123',
      role: 'recruiter',
      company: 'TechCorp',
      position: 'Engineering Manager',
      phone: '+92 300 1234567',
    });
    console.log('   ✓ Recruiter created');

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
    console.log('   ✓ Candidate created\n');

    // 5. Create jobs
    console.log('💼 Creating jobs...');
    const job = await Job.create({
      recruiter: recruiter._id,
      title: 'Frontend Developer',
      description:
        'We are looking for a Frontend Developer to build modern, responsive UIs using React and Tailwind CSS.',
      company: 'TechCorp',
      location: 'Remote',
      type: 'Full-time',
      salary: '$60k-80k',
      skills: ['React', 'Tailwind', 'JavaScript'],
    });
    console.log('   ✓ Job created\n');

    // 6. Create application
    console.log('📄 Creating application...');
    await Application.create({
      job: job._id,
      candidate: candidate._id,
      resume: 'https://example.com/ali-cv.pdf',
      coverLetter: 'I am excited about this role because...',
      status: 'applied',
    });

    // Update job applicant count
    job.applicantsCount = 1;
    await job.save();
    console.log('   ✓ Application created\n');

    // 7. Summary
    console.log('═══════════════════════════════════════');
    console.log('✅ SEED COMPLETE');
    console.log('═══════════════════════════════════════');
    console.log('Demo accounts:');
    console.log('   Admin     → admin@hirehub.com    / admin123');
    console.log('   Recruiter → saad@techcorp.com    / password123');
    console.log('   Candidate → ali@mail.com         / password123');
    console.log('═══════════════════════════════════════\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err.stack);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();