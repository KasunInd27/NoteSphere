import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    blocksPreset: {
        type: Array, // Array of block data structures
        required: true,
    },
    isSystem: {
        type: Boolean,
        default: false,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // Null for system templates
    },
}, {
    timestamps: true,
});

const Template = mongoose.model('Template', templateSchema);

export default Template;
