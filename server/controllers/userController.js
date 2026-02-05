import mongoose from 'mongoose';
import User from '../models/User.js';
import Page from '../models/Page.js';

// @desc    Toggle favorite page
// @route   POST /api/users/favorites/:pageId
// @access  Private
const toggleFavorite = async (req, res) => {
    try {
        const { pageId } = req.params;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if page exists and user owns it
        const page = await Page.findOne({ _id: pageId, ownerId: req.user._id });
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        const isFavorite = user.favorites.includes(pageId);

        // Atomic update
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            isFavorite
                ? { $pull: { favorites: pageId } }
                : { $addToSet: { favorites: pageId } },
            { new: true }
        );

        res.json({ favorites: updatedUser.favorites, isFavorite: !isFavorite });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get favorite pages
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'favorites',
            match: { isArchived: false }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.favorites || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Track page visit (for recents)
// @route   POST /api/users/recent/:pageId
// @access  Private
const trackPageVisit = async (req, res) => {
    try {
        const { pageId } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(pageId)) {
            return res.status(400).json({ message: 'Invalid page ID format' });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Check if page exists and user owns it
        const page = await Page.findOne({ _id: pageId, ownerId: req.user._id });
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        // Atomic update to prevent version conflicts
        // 1. Remove existing entry for this page (if any)
        // 2. Add to front with current timestamp
        // 3. Limit to 10 items using $slice
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $pull: { recentPages: { pageId: pageId } }
            },
            { new: true }
        );

        // Now push to front
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $push: {
                    recentPages: {
                        $each: [{ pageId, lastOpenedAt: new Date() }],
                        $position: 0,
                        $slice: 10 // Keep only first 10 items
                    }
                }
            },
            { new: true }
        );

        res.json({ ok: true });
    } catch (error) {
        console.error('Track page visit error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Get recent pages
// @route   GET /api/users/recent
// @access  Private
const getRecentPages = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'recentPages.pageId',
            match: { isArchived: false }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter out null pages (archived or deleted)
        const recentPages = user.recentPages
            .filter(item => item.pageId)
            .map(item => ({
                ...item.pageId.toObject(),
                lastOpenedAt: item.lastOpenedAt
            }));

        res.json(recentPages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { toggleFavorite, getFavorites, trackPageVisit, getRecentPages };
