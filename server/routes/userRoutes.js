import express from 'express';
import {
  getUserById,
  updateMyProfile,
  listCandidates,
  getCandidateProfile,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Own profile
router.put('/me', protect, updateMyProfile);

// Recruiter-only candidate directory
router.get('/candidates', protect, authorize('recruiter'), listCandidates);
router.get(
  '/candidates/:id',
  protect,
  authorize('recruiter'),
  getCandidateProfile
);

// Any user lookup
router.get('/:id', protect, getUserById);

export default router;