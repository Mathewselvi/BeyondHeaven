const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5']
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent user from submitting more than one review per room
ReviewSchema.index({ room: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
