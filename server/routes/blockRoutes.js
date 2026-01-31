import express from 'express';
import { createBlock, updateBlock, deleteBlock } from '../controllers/blockController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createBlock);

router.route('/:id')
    .put(protect, updateBlock)
    .delete(protect, deleteBlock);

export default router;
