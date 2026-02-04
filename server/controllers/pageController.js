import Page from '../models/Page.js';
import Block from '../models/Block.js';

// @desc    Create a new page
// @route   POST /api/pages
// @access  Private
// @desc    Create a new page
// @route   POST /api/pages
// @access  Private
const createPage = async (req, res) => {
    const { title, parentId, icon, coverUrl, template } = req.body;

    try {
        const page = await Page.create({
            ownerId: req.user._id,
            parentId: parentId || null,
            title: title || (template ? template.replace('-', ' ') : 'Untitled'),
            icon: icon || (template ? '📝' : undefined),
            coverUrl,
        });

        if (template) {
            const templateBlocks = getTemplateBlocks(template, page._id);
            if (templateBlocks.length > 0) {
                await Block.insertMany(templateBlocks);
            }
        }

        res.status(201).json(page);
    } catch (error) {
        res.status(400).json({ message: 'Invalid page data' });
    }
};

// Helper for templates
const getTemplateBlocks = (type, pageId) => {
    const blocks = [];

    if (type === 'meeting-notes') {
        blocks.push(
            { pageId, type: 'heading', content: '<h2>Agenda</h2>', props: { level: 2 }, order: 1000 },
            { pageId, type: 'bullet-list', content: '<p>Topic 1</p>', order: 2000 },
            { pageId, type: 'bullet-list', content: '<p>Topic 2</p>', order: 3000 },
            { pageId, type: 'heading', content: '<h2>Action Items</h2>', props: { level: 2 }, order: 4000 },
            { pageId, type: 'check-list', content: '<p>Task 1</p>', order: 5000 }
        );
    } else if (type === 'project-plan') {
        blocks.push(
            { pageId, type: 'heading', content: '<h2>Overview</h2>', props: { level: 2 }, order: 1000 },
            { pageId, type: 'paragraph', content: '<p>Project goals and objectives...</p>', order: 2000 },
            { pageId, type: 'heading', content: '<h2>Milestones</h2>', props: { level: 2 }, order: 3000 },
            { pageId, type: 'bullet-list', content: '<p>Phase 1</p>', order: 4000 }
        );
    }

    return blocks;
};

// @desc    Get all pages for current user (Flat list, frontend constructs tree)
// @route   GET /api/pages
// @access  Private
const getPages = async (req, res) => {
    try {
        const pages = await Page.find({ ownerId: req.user._id, isArchived: false }).sort({ updatedAt: -1 });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single page by ID
// @route   GET /api/pages/:id
// @access  Private
const getPage = async (req, res) => {
    try {
        const page = await Page.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (page) {
            res.json(page);
        } else {
            res.status(404).json({ message: 'Page not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update page
// @route   PUT /api/pages/:id
// @access  Private
const updatePage = async (req, res) => {
    try {
        const page = await Page.findOne({ _id: req.params.id, ownerId: req.user._id });

        if (page) {
            page.title = req.body.title || page.title;
            page.icon = req.body.icon !== undefined ? req.body.icon : page.icon;
            page.coverUrl = req.body.coverUrl !== undefined ? req.body.coverUrl : page.coverUrl;
            page.coverPublicId = req.body.coverPublicId !== undefined ? req.body.coverPublicId : page.coverPublicId;
            page.isArchived = req.body.isArchived !== undefined ? req.body.isArchived : page.isArchived;

            const updatedPage = await page.save();
            res.json(updatedPage);
        } else {
            res.status(404).json({ message: 'Page not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete page (and recursive children)
// @route   DELETE /api/pages/:id
// @access  Private
const deletePage = async (req, res) => {
    try {
        const page = await Page.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        // Recursive delete helper
        const recursiveDelete = async (pageId) => {
            const children = await Page.find({ parentId: pageId });
            for (const child of children) {
                await recursiveDelete(child._id);
            }
            await Block.deleteMany({ pageId });
            await Page.deleteOne({ _id: pageId });
        };

        await recursiveDelete(page._id);
        res.json({ message: 'Page removed' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createPage, getPages, getPage, updatePage, deletePage };
