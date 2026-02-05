import mongoose from 'mongoose';
import Block from '../models/Block.js';
import Page from '../models/Page.js';

// @desc    Get blocks for a page
// @route   GET /api/pages/:pageId/blocks
// @access  Private
const getBlocks = async (req, res) => {
    try {
        const page = await Page.findOne({ _id: req.params.pageId, ownerId: req.user._id });
        if (!page) {
            return res.status(404).json({ message: 'Page not found or unauthorized' });
        }

        const blocks = await Block.find({ pageId: req.params.pageId }).sort('order');
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create/Update/Delete blocks in bulk (Sync) or single operations
//          For now, let's implement basic CRUD.
// @route   POST /api/blocks
// @access  Private
const createBlock = async (req, res) => {
    const { pageId, type, content, order, props } = req.body;
    try {
        console.log('Create block request:', { pageId, type, userId: req.user?._id });

        const page = await Page.findOne({ _id: pageId, ownerId: req.user._id });
        if (!page) {
            console.log('Page not found or unauthorized:', pageId);
            return res.status(404).json({ message: 'Page not found' });
        }

        const block = await Block.create({
            pageId,
            type,
            content,
            order,
            props
        });

        console.log('Block created successfully:', block._id);
        res.status(201).json(block);
    } catch (error) {
        console.error('Create block error:', error);
        res.status(400).json({ message: error.message });
    }
}

// @desc    Update a block
// @route   PUT/PATCH /api/blocks/:id
// @access  Private
const updateBlock = async (req, res) => {
    try {
        const blockId = req.params.id;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(blockId)) {
            return res.status(400).json({
                message: 'Invalid block ID format',
                id: blockId
            });
        }

        console.log('📝 Update block request:', {
            id: blockId,
            bodyKeys: Object.keys(req.body),
            userId: req.user?._id
        });

        // Debug: Count total blocks in DB
        const totalBlocks = await Block.countDocuments();
        console.log('📊 Total blocks in database:', totalBlocks);

        // Find the block first
        const block = await Block.findById(blockId);

        if (!block) {
            return res.status(404).json({
                message: 'Block not found',
                id: blockId
            });
        }

        console.log('✅ Block found:', {
            blockId: block._id,
            pageId: block.pageId,
            type: block.type
        });

        // Verify ownership via page
        const page = await Page.findOne({ _id: block.pageId, ownerId: req.user._id });
        if (!page) {
            console.log('🔒 Unauthorized access to block:', blockId);
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Build update object - only update fields that are provided
        const update = {};
        if (req.body.content !== undefined) update.content = req.body.content;
        if (req.body.type !== undefined) update.type = req.body.type;
        if (req.body.props !== undefined) update.props = req.body.props;
        if (req.body.order !== undefined) update.order = req.body.order;

        console.log('🔄 Updating block with:', update);

        // Update and return new document
        const updatedBlock = await Block.findByIdAndUpdate(
            blockId,
            update,
            { new: true, runValidators: true }
        );

        console.log('✅ Block updated successfully:', updatedBlock._id);
        res.json(updatedBlock);

    } catch (error) {
        console.error('❌ Update block error:', error);
        res.status(400).json({ message: error.message });
    }
}


// @desc Delete a block
// @route DELETE /api/blocks/:id
const deleteBlock = async (req, res) => {
    try {
        const block = await Block.findById(req.params.id);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        // Verify ownership via page
        const page = await Page.findOne({ _id: block.pageId, ownerId: req.user._id });
        if (!page) return res.status(401).json({ message: 'Not authorized' });

        await block.deleteOne();
        res.json({ message: 'Block removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { getBlocks, createBlock, updateBlock, deleteBlock };
