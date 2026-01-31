import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['paragraph', 'heading', 'bulletList', 'orderedList', 'todo', 'code', 'image', 'divider', 'quote', 'callout'],
        default: 'paragraph',
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // Can be string or object (for JSON content)
        default: '',
    },
    props: {
        type: Object, // Additional properties like checked state for todos, language for code, etc.
        default: {},
    },
    order: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

// Index for fetching blocks of a page in order
blockSchema.index({ pageId: 1, order: 1 });

const Block = mongoose.model('Block', blockSchema);

export default Block;
