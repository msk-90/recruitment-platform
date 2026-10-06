import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Ensure upload directory exists
const uploadDir = 'uploads/documents';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // CRITICAL: use random filename, never the original name
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomName}${ext}`);
  },
});

// File filter — only CV/resume formats
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(pdf|doc|docx)$/i;
  const extOk = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extOk) {
    return cb(null, true);
  }
  cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
};

// Export configured multer
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter,
});

// Convenience — single file upload with field name "resume"
export const uploadResume = upload.single('resume');