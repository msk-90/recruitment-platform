import express from 'express';
import {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';

const router = express.Router();

router.post('/', applyToJob);
router.get('/job/:jobId', getApplicationsForJob);
router.get('/me', getMyApplications);
router.put('/:id/status', updateApplicationStatus);

export default router;
