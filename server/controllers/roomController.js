const Room = require('../models/Room');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// @desc    Get all rooms (with optional availability filter)
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
    try {
        const { checkIn, checkOut, guests, adults, children } = req.query;

        let query = {};

        // Calculate total guests
        let totalGuests = 0;
        if (guests) totalGuests = Number(guests);
        if (adults) totalGuests = Number(adults);
        if (children) totalGuests += Number(children);

        // Filter by Guests capacity
        if (totalGuests > 0) {
            // Logic: Normal capacity check OR Extra Bed logic (Capacity 3 can fit 4)
            // "capacity will be 3 and if 4 will be given extra bed"
            query.$or = [
                { maxGuests: { $gte: totalGuests } },
                {
                    maxGuests: { $gte: 3 },
                    $expr: { $eq: [4, totalGuests] } // Only allow extra bed for 4 guests scenario fitting in 3-capacity room
                }
            ];
        }

        // 1. Get initial list of matching rooms (by capacity, etc.)
        let rooms = await Room.find(query).populate('propertyId', 'name location');

        // 2. Filter by Availability if dates provided
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);

            // Find bookings that overlap with requested dates
            const overlappingBookings = await Booking.find({
                status: { $in: ['pending', 'confirmed'] },
                $or: [
                    { 'dates.checkIn': { $lt: end }, 'dates.checkOut': { $gt: start } }
                ]
            }).select('room');

            const bookedRoomIds = overlappingBookings.map(b => b.room.toString());

            // Filter out booked rooms
            rooms = rooms.filter(room => !bookedRoomIds.includes(room._id.toString()));
        }

        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id).populate('propertyId');
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        res.status(200).json({ success: true, data: room });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin)
exports.createRoom = async (req, res, next) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json({ success: true, data: room });
    } catch (err) {
        next(err);
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
exports.updateRoom = async (req, res, next) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        res.status(200).json({ success: true, data: room });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
exports.deleteRoom = async (req, res, next) => {
    try {
        // Cascade Delete: Delete all associated bookings first
        const Booking = require('../models/Booking');
        await Booking.deleteMany({ room: req.params.id });

        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
