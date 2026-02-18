const express = require('express');
const { getPageContent, updateSectionContent } = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
        cb(null, true);
    } else {
        cb(new Error('Please upload an image or video file'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for videos
});

router.get('/:page', getPageContent);
router.put('/:page/:section', protect, authorize('admin'), upload.array('files', 20), updateSectionContent);

module.exports = router;
