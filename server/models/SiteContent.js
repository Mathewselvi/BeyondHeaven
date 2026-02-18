const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
        enum: ['home', 'about', 'contact', 'rooms', 'gallery']
    },
    section: {
        type: String,
        required: true
    },
    type: {
        type: String, // 'video', 'slideshow', 'image', 'text'
        default: 'image'
    },
    // For Hero Video
    videoUrl: {
        type: String
    },
    // For Slideshow or Gallery
    images: [{
        type: String // URLs
    }],
    // For Text Content
    title: String,
    subtitle: String,
    description: String,

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Composite key to ensure one content config per section per page
SiteContentSchema.index({ page: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('SiteContent', SiteContentSchema);
