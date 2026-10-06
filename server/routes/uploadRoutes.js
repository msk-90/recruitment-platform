import express from 'express';
import { uploadResume } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/resume',
  protect,
  (req, res, next) => {
    uploadResume(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: err.message || 'File upload failed',
        });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file selected' });
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: `/uploads/documents/${req.file.filename}`,
      },
    });
  }
);

export default router;