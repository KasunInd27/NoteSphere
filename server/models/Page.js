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
    coverUrl: {
        type: String,
        default: null,
    },
    coverPublicId: {
        type: String, // Cloudinary ID for deletion
        default: null,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    content: {
        type: Array, // For simple content updates if not using separate blocks model completely, but we are using blocks.
        default: [],
    }
}, {
    timestamps: true,
});

// Index for faster queries on parent/owner
pageSchema.index({ ownerId: 1, parentId: 1 });

const Page = mongoose.model('Page', pageSchema);

export default Page;
