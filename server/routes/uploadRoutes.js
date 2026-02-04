import express from 'express';
import { generatePresignedUrl, deleteFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/presign', protect, generatePresignedUrl);
router.delete('/', protect, deleteFile);

export default router;
