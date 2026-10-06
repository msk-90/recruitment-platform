import express from 'express';
import {
  getPlatformStats,
  listAllUsers,
  toggleBanUser,
  changeUserRole,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', listAllUsers);
router.put('/users/:id/ban', toggleBanUser);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

export default router;