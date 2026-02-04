import mongoose from 'mongoose';

const snapshotSchema = mongoose.Schema({
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Page'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    blocks: {
        type: Array,
        required: true
    },
    // We store a simplified version of blocks.
    // Ideally we store the full JSON.
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 // Auto-delete after 30 days for MVP? Or keep forever.
        // Let's keep forever for now but maybe limit count logic later.
    }
}, {
    timestamps: true
});

const Snapshot = mongoose.model('Snapshot', snapshotSchema);

export default Snapshot;
