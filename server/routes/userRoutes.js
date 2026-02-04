import express from 'express';
import { toggleFavorite, getFavorites, trackPageVisit, getRecentPages } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Favorites routes
router.post('/favorites/:pageId', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

// Recent pages routes
router.post('/recent/:pageId', protect, trackPageVisit);
router.get('/recent', protect, getRecentPages);

export default router;
