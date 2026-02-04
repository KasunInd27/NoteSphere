import Snapshot from '../models/Snapshot.js';
import Block from '../models/Block.js';

// @desc    Create a snapshot of the current page state
// @route   POST /api/pages/:pageId/snapshots
// @access  Private
const createSnapshot = async (req, res) => {
    try {
        const { pageId } = req.params;

        // Fetch all blocks
        const blocks = await Block.find({ pageId }).sort('order');

        const snapshot = await Snapshot.create({
            pageId,
            createdBy: req.user._id,
            blocks: blocks
        });

        res.status(201).json(snapshot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get snapshots for a page
// @route   GET /api/pages/:pageId/snapshots
// @access  Private
const getSnapshots = async (req, res) => {
    try {
        const snapshots = await Snapshot.find({ pageId: req.params.pageId })
            .sort({ createdAt: -1 })
            .select('-blocks') // Don't send full content in list
            .limit(20);
        res.json(snapshots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Restore a snapshot
// @route   POST /api/snapshots/:id/restore
// @access  Private
const restoreSnapshot = async (req, res) => {
    try {
        const snapshot = await Snapshot.findById(req.params.id);
        if (!snapshot) {
            return res.status(404).json({ message: 'Snapshot not found' });
        }

        // Ideally verify page ownership again
        // const page = await Page.findOne({ _id: snapshot.pageId, ownerId: req.user._id }); ...

        // Delete current blocks
        await Block.deleteMany({ pageId: snapshot.pageId });

        // Insert snapshot blocks
        // We need to regenerate IDs or keep them? 
        // If we keep IDs, socket updates might get confused if clients have old state.
        // Typically, we might regenerate IDs to force refresh on clients.
        // But for simplicity, let's reuse content but assign NEW IDs to avoid conflicts / simplify "new" state.

        const newBlocks = snapshot.blocks.map(b => ({
            pageId: snapshot.pageId,
            type: b.type,
            content: b.content,
            props: b.props,
            order: b.order
        }));

        await Block.insertMany(newBlocks);

        res.json({ message: 'Page restored' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createSnapshot, getSnapshots, restoreSnapshot };
