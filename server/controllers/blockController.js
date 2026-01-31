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
        const page = await Page.findOne({ _id: pageId, ownerId: req.user._id });
        if (!page) return res.status(404).json({ message: 'Page not found' });

        const block = await Block.create({
            pageId,
            type,
            content,
            order,
            props
        });
        res.status(201).json(block);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// @desc    Update a block
// @route   PUT /api/blocks/:id
// @access  Private
const updateBlock = async (req, res) => {
    try {
        const block = await Block.findById(req.params.id);
        if (!block) return res.status(404).json({ message: 'Block not found' });

        // Verify ownership via page
        const page = await Page.findOne({ _id: block.pageId, ownerId: req.user._id });
        if (!page) return res.status(401).json({ message: 'Not authorized' });

        block.content = req.body.content !== undefined ? req.body.content : block.content;
        block.type = req.body.type || block.type;
        block.props = req.body.props || block.props;
        block.order = req.body.order !== undefined ? req.body.order : block.order;

        const updatedBlock = await block.save();
        res.json(updatedBlock);

    } catch (error) {
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
