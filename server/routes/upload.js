const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Init Multer with "Unlimited" limits
const upload = multer({
    storage: storage,
    limits: {
        fileSize: Infinity, // No limit
        files: Infinity     // No limit
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check File Type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// @route   POST /api/upload
// @desc    Upload multiple images
// @access  Public (or Private)
router.post('/', upload.array('images'), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files uploaded.');
        }

        // Return paths as relative for portability
        const fileUrls = req.files.map(file => {
            const url = `/uploads/${file.filename}`;
            console.log('File uploaded:', url); // Debug
            return url;
        });

        res.json({
            success: true,
            data: fileUrls
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
