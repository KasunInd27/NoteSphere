import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    avatar: {
        url: { type: String },
        key: { type: String }
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page'
    }],
    recentPages: [{
        pageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Page'
        },
        lastOpenedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
