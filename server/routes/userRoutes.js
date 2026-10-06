import express from 'express';
import { body } from 'express-validator';
import {
  getUserById,
  updateMyProfile,
  changePassword,
  listCandidates,
  getCandidateProfile,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

// ── Own profile ──
// IMPORTANT: /me/password must come before /me and /:id
router.put(
  '/me/password',
  protect,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  changePassword
);

router.put('/me', protect, updateMyProfile);

// ── Recruiter-only candidate directory ──
router.get('/candidates', protect, authorize('recruiter'), listCandidates);
router.get(
  '/candidates/:id',
  protect,
  authorize('recruiter'),
  getCandidateProfile
);

// ── Any user lookup (must come last) ──
router.get('/:id', protect, getUserById);

export default router;