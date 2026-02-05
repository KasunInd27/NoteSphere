import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        default: null,
    },
    title: {
        type: String,
        default: 'Untitled',
    },
    icon: {
        type: String, // Emoji or URL
        default: null,
    },
    cover: {
        url: { type: String, default: null },
        key: { type: String, default: null }
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    content: {
        type: Array, // For simple content updates if not using separate blocks model completely, but we are using blocks.
        default: [],
    },
    properties: {
        tags: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Complete', 'Archived'],
            default: 'Not Started'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastEditedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: true,
});

// Index for faster queries on parent/owner
pageSchema.index({ ownerId: 1, parentId: 1 });

const Page = mongoose.model('Page', pageSchema);

export default Page;
