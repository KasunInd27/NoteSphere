import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        required: true,
    },
    snapshot: {
        type: Object, // Full JSON dump of page + blocks
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

const Version = mongoose.model('Version', versionSchema);

export default Version;
