const Property = require('../models/Property');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
    try {
        const properties = await Property.find();
        res.status(200).json({ success: true, count: properties.length, data: properties });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        res.status(200).json({ success: true, data: property });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Admin)
exports.createProperty = async (req, res, next) => {
    try {
        const property = await Property.create(req.body);
        res.status(201).json({ success: true, data: property });
    } catch (err) {
        next(err);
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Admin)
exports.updateProperty = async (req, res, next) => {
    try {
        const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        res.status(200).json({ success: true, data: property });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Admin)
exports.deleteProperty = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        // Delete associated rooms first
        // Cascade Delete: Delete associated bookings then rooms
        const Room = require('../models/Room');
        const Booking = require('../models/Booking');

        // Find all rooms for this property to delete their bookings
        const rooms = await Room.find({ propertyId: req.params.id });
        const roomIds = rooms.map(room => room._id);

        await Booking.deleteMany({ room: { $in: roomIds } });
        await Room.deleteMany({ propertyId: req.params.id });

        await property.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
