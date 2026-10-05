import express from 'express';
import {
  getJobs,
  getJobById,
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobApplicants,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getJobs);

// Recruiter: own jobs
router.get('/me', protect, authorize('recruiter'), getMyJobs);

// Recruiter: create
router.post('/', protect, authorize('recruiter'), createJob);

// Recruiter: view applicants for a job
router.get(
  '/:id/applicants',
  protect,
  authorize('recruiter'),
  getJobApplicants
);

// Public: single job
router.get('/:id', getJobById);

// Recruiter: update/delete own
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

export default router;