const SiteContent = require('../models/SiteContent');
const path = require('path');
const fs = require('fs');

// @desc    Get content by page
// @route   GET /api/content/:page
// @access  Public
exports.getPageContent = async (req, res) => {
    try {
        const content = await SiteContent.find({ page: req.params.page });
        res.status(200).json({ success: true, data: content });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update or Create Section Content
// @route   PUT /api/content/:page/:section
// @access  Private/Admin
exports.updateSectionContent = async (req, res) => {
    const { page, section } = req.params;
    const { type, videoUrl, title, subtitle, description, existingImages } = req.body;

    try {
        let contentConfig = await SiteContent.findOne({ page, section });

        if (!contentConfig) {
            contentConfig = new SiteContent({ page, section });
        }

        // Update fields
        if (type) contentConfig.type = type;
        if (videoUrl !== undefined) contentConfig.videoUrl = videoUrl;
        if (title !== undefined) contentConfig.title = title;
        if (subtitle !== undefined) contentConfig.subtitle = subtitle;
        if (description !== undefined) contentConfig.description = description;

        // Handle Images
        // existingImages might be passed as JSON string or array
        let currentImages = [];
        if (existingImages) {
            try {
                const parsed = Array.isArray(existingImages) ? existingImages : JSON.parse(existingImages);
                currentImages = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error("JSON Parse Error for existingImages:", e);
                currentImages = [];
            }
        }

        // Add new uploaded files
        let newImages = [];
        if (req.files) {
            newImages = req.files.map(file => `/uploads/${file.filename}`);
        }

        // Combine logic: 
        // If it's a slideshow, we might want to append or replace. 
        // For simplicity: If 'existingImages' is provided, we treat that as the "kept" images.
        // Then we append new ones. 
        // If type is 'video', images might be ignored or cleared depending on logic, but we'll modify to keep them just in case user switches back.

        // However, user requirement says "option for 8 - 10 images".
        // Let's assume we replace the list with provided + new.

        if (type === 'slideshow' || type === 'image') {
            // If this is a fresh update, we rely on the client to tell us which old images to keep.
            // If req.body.existingImages is not sent, we might assume clear all? 
            // To be safe: if existingImages is undefined, keep OLD images. If it's sent (even empty), use it.

            if (existingImages !== undefined) {
                contentConfig.images = [...currentImages, ...newImages];
            } else if (newImages.length > 0) {
                contentConfig.images = [...(contentConfig.images || []), ...newImages];
            }
        }

        // Special case for video: if video file uploaded? 
        // User asked: "option for adding video" -> "when ever he likes to add video there should be option for add video as hero"
        // If a video file is uploaded, we save it to videoUrl
        if (req.files && req.files.length > 0) {
            const videoFile = req.files.find(f => f.mimetype.startsWith('video'));
            if (videoFile) {
                contentConfig.videoUrl = `/uploads/${videoFile.filename}`;
                contentConfig.type = 'video'; // Force type switch if video uploaded
            }
        }

        contentConfig.updatedAt = Date.now();
        await contentConfig.save();

        res.status(200).json({ success: true, data: contentConfig });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};
