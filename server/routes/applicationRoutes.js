import express from 'express';
import {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Candidate: apply
router.post('/', protect, authorize('candidate'), applyToJob);

// Candidate: my applications
router.get('/me', protect, authorize('candidate'), getMyApplications);

// Recruiter: applications for a specific job
router.get(
  '/job/:jobId',
  protect,
  authorize('recruiter'),
  getApplicationsForJob
);

// Single application (owner candidate OR job recruiter)
router.get('/:id', protect, getApplicationById);

// Recruiter: update status
router.put(
  '/:id/status',
  protect,
  authorize('recruiter'),
  updateApplicationStatus
);

// Candidate: withdraw
router.delete('/:id', protect, authorize('candidate'), withdrawApplication);

export default router;