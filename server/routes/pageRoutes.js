import express from 'express';
import { createPage, getPages, getPage, updatePage, deletePage } from '../controllers/pageController.js';
import { getBlocks } from '../controllers/blockController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createPage)
    .get(protect, getPages);

router.route('/:id')
    .get(protect, getPage)
    .put(protect, updatePage)
    .delete(protect, deletePage);

// Get blocks for a specific page
router.route('/:pageId/blocks').get(protect, getBlocks);

import { createSnapshot, getSnapshots } from '../controllers/snapshotController.js';
router.route('/:pageId/snapshots')
    .post(protect, createSnapshot)
    .get(protect, getSnapshots);

export default router;
