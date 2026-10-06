import express from 'express';
import { body } from 'express-validator';
import {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('candidate'),
  [
    body('jobId').isMongoId().withMessage('Valid job ID required'),
    body('resume').trim().notEmpty().withMessage('Resume is required'),
    body('coverLetter').optional().isLength({ max: 2000 }),
  ],
  validate,
  applyToJob
);

router.get('/me', protect, authorize('candidate'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter'), getApplicationsForJob);
router.get('/:id', protect, getApplicationById);

router.put(
  '/:id/status',
  protect,
  authorize('recruiter'),
  [
    body('status')
      .isIn(['applied', 'shortlisted', 'interview', 'hired', 'rejected'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateApplicationStatus
);

router.delete('/:id', protect, authorize('candidate'), withdrawApplication);

export default router;