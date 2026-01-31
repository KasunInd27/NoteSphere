import mongoose from 'mongoose';

const shareLinkSchema = new mongoose.Schema({
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    permission: {
        type: String,
        enum: ['read', 'comment', 'edit'],
        default: 'read',
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

const ShareLink = mongoose.model('ShareLink', shareLinkSchema);

export default ShareLink;
