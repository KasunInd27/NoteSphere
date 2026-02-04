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

        if (isFavorite) {
            // Remove from favorites
            user.favorites = user.favorites.filter(id => id.toString() !== pageId);
        } else {
            // Add to favorites
            user.favorites.push(pageId);
        }

        await user.save();
        res.json({ favorites: user.favorites, isFavorite: !isFavorite });
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

// @desc    Track page visit
// @route   POST /api/users/recent/:pageId
// @access  Private
const trackPageVisit = async (req, res) => {
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

        // Remove existing entry if present
        user.recentPages = user.recentPages.filter(
            item => item.pageId.toString() !== pageId
        );

        // Add to beginning
        user.recentPages.unshift({
            pageId,
            lastOpenedAt: new Date()
        });

        // Keep only last 10
        user.recentPages = user.recentPages.slice(0, 10);

        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
