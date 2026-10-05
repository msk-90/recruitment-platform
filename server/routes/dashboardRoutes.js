import express from 'express';
import {
  getRecruiterDashboard,
  getCandidateDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/recruiter',
  protect,
  authorize('recruiter'),
  getRecruiterDashboard
);

router.get(
  '/candidate',
  protect,
  authorize('candidate'),
  getCandidateDashboard
);

export default router;