import express from 'express';
import { body } from 'express-validator';
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
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/me', protect, authorize('recruiter'), getMyJobs);

router.post(
  '/',
  protect,
  authorize('recruiter'),
  [
    body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title 3–120 chars'),
    body('description').trim().isLength({ min: 20 }).withMessage('Description min 20 chars'),
    body('location').trim().notEmpty().withMessage('Location required'),
    body('type').isIn(['Full-time', 'Part-time', 'Contract', 'Internship']).withMessage('Invalid type'),
    body('skills').optional().isArray(),
  ],
  validate,
  createJob
);

router.get('/:id/applicants', protect, authorize('recruiter'), getJobApplicants);
router.get('/:id', getJobById);

router.put(
  '/:id',
  protect,
  authorize('recruiter'),
  [
    body('title').optional().trim().isLength({ min: 3, max: 120 }),
    body('description').optional().trim().isLength({ min: 20 }),
    body('type').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Internship']),
    body('status').optional().isIn(['open', 'closed']),
  ],
  validate,
  updateJob
);

router.delete('/:id', protect, authorize('recruiter'), deleteJob);

export default router;