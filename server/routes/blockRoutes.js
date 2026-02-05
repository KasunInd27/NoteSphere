import express from 'express';
import { getBlocks, createBlock, updateBlock, deleteBlock } from '../controllers/blockController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get blocks for a page
router.get('/page/:pageId', protect, getBlocks);

// Create block
router.post('/', protect, createBlock);

// Update and delete block
router.route('/:id')
    .put(protect, updateBlock)
    .patch(protect, updateBlock) // Support both PUT and PATCH
    .delete(protect, deleteBlock);

export default router;
