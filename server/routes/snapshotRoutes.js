import express from 'express';
import { restoreSnapshot } from '../controllers/snapshotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:id/restore', protect, restoreSnapshot);

export default router;
