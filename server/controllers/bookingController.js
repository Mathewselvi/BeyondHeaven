const Booking = require('../models/Booking');
const Room = require('../models/Room');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/asyncHandler');

// Helper to calculate total price
const calculateTotalPrice = (checkIn, checkOut, pricePerNight) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights * pricePerNight;
};

// @desc    Check room availability
// @route   POST /api/bookings/check-availability
// @access  Public
// @desc    Check room availability
// @route   POST /api/bookings/check-availability
// @access  Public
exports.checkAvailability = asyncHandler(async (req, res, next) => {
    const { roomId, checkIn, checkOut } = req.body;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
        return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    // Check for overlapping bookings for this room
    const existingBooking = await Booking.findOne({
        room: roomId,
        status: { $in: ['pending', 'confirmed'] }, // Ignore cancelled
        $or: [
            { 'dates.checkIn': { $lt: end }, 'dates.checkOut': { $gt: start } }
        ]
    });

    if (existingBooking) {
        return res.status(200).json({ success: true, available: false, message: 'Room is booked for these dates' });
    }

    res.status(200).json({ success: true, available: true, message: 'Room is available' });
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public (Guest Checkout)
// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public (Guest Checkout)
exports.createBooking = asyncHandler(async (req, res, next) => {
    const { roomId, checkIn, checkOut, guests, guest, totalAmount, source, advanceAmount, mealPlan } = req.body;

    // NOTE: Basic validation removed as it is handled by Joi middleware in the route

    const room = await Room.findById(roomId);
    if (!room) {
        return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Validate Capacity
    const guestCount = typeof guests === 'object' ? (guests.adults + (guests.children || 0)) : guests;

    if (guestCount > room.maxGuests) {
        return res.status(400).json({ success: false, message: `Max guests allowed is ${room.maxGuests}` });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    // Re-check availability
    const existingBooking = await Booking.findOne({
        room: roomId,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            { 'dates.checkIn': { $lt: end }, 'dates.checkOut': { $gt: start } }
        ]
    });

    if (existingBooking) {
        return res.status(400).json({ success: false, message: 'Room is already booked for these dates' });
    }

    // Helper to select price based on meal plan
    let pricePerNight = room.price; // Default CP
    if (mealPlan === 'EP') pricePerNight = room.priceEP;
    if (mealPlan === 'MAP') pricePerNight = room.priceMAP;

    // Fallback if specific price not set (though required in model)
    if (!pricePerNight) pricePerNight = room.price;

    let calculatedPrice = calculateTotalPrice(start, end, pricePerNight);

    // Add Extra Bed cost
    if (guests && guests.extraBeds > 0) {
        const extraBedPrice = Number(room.priceExtraBed) || 0;
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        calculatedPrice += (extraBedPrice * Number(guests.extraBeds) * nights);
    }

    const booking = await Booking.create({
        guest,
        room: roomId,
        dates: { checkIn: start, checkOut: end },
        guests: typeof guests === 'object' ? guests : { adults: guests, children: 0, extraBeds: 0 },
        mealPlan: mealPlan || 'CP',
        totalPrice: totalAmount || calculatedPrice,
        advanceAmount: advanceAmount || 0,
        source: source || 'site',
        status: source && source !== 'site' ? 'confirmed' : 'pending' // Manual bookings are often auto-confirmed
    });

    // Send Email to Guest
    if (guest.email) {
        try {
            if (!source || source === 'site') {
                // Site Booking - Request Pending
                await sendEmail({
                    email: guest.email,
                    subject: 'BeyondHeaven - Booking Request Received',
                    message: `Dear ${guest.name},\n\nWe have received your booking request for ${room.name} (${checkIn} to ${checkOut}).\n\nStatus: PENDING APPROVAL.\n\nOur team will review your request. You will receive a separate confirmation email once your booking is approved.\n\nTotal Estimate: ₹${calculatedPrice}\n\nWarm Regards,\nBeyondHeaven Team`
                });
            } else {
                // Manual Booking - Confirmed
                await sendEmail({
                    email: guest.email,
                    subject: 'BeyondHeaven - Booking Confirmed! 🌴',
                    message: `Dear ${guest.name},\n\nYour booking at ${room.name} has been CONFIRMED.\n\nDates: ${checkIn} to ${checkOut}\nTotal Price: ₹${totalAmount || calculatedPrice}\n\nWe look forward to welcoming you to paradise.\n\nWarm Regards,\nBeyondHeaven Team`
                });
            }
        } catch (emailError) {
            console.error('Guest Booking Email failed:', emailError);
        }
    }

    // Send Notification to Admin (Only for site bookings)
    if (!source || source === 'site') {
        try {
            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            const extraBedsCount = (guests && guests.extraBeds) ? guests.extraBeds : 0;
            const extraBedDetails = extraBedsCount > 0 ? `\nExtra Beds: ${extraBedsCount} (Rate: ₹${room.priceExtraBed}/night)` : '';

            await sendEmail({
                email: process.env.SMTP_EMAIL, // Admin email from .env
                subject: `New Booking Request - ${guest.name}`,
                message: `ADMIN ALERT: New Booking Request\n\nGuest Details:\nName: ${guest.name}\nEmail: ${guest.email}\nPhone: ${guest.phone}\n\nStay Details:\nRoom: ${room.name}\nDates: ${checkIn} to ${checkOut} (${nights} Night${nights > 1 ? 's' : ''})\nGuests: ${guestCount} (Adults: ${guests.adults || 1}, Children: ${guests.children || 0})\n\nPreferences:\nMeal Plan: ${mealPlan || 'CP'}${extraBedDetails}\n\nFinancials:\nTotal Price: ₹${calculatedPrice}\n\nPlease login to the dashboard to approve or reject this request.`
            });
        } catch (emailError) {
            console.error('Admin Alert Email failed:', emailError);
        }
    }

    res.status(201).json({ success: true, data: booking });
});

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id
// @access  Private (Admin)
exports.updateBooking = asyncHandler(async (req, res, next) => {
    const { status, advanceAmount, guest, guests, dates, totalPrice, source, mealPlan, roomId } = req.body;

    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (status) booking.status = status;
    if (advanceAmount !== undefined) booking.advanceAmount = advanceAmount;
    if (guest) booking.guest = { ...booking.guest, ...guest };
    if (guests) booking.guests = { ...booking.guests, ...guests };
    if (dates) booking.dates = { ...booking.dates, ...dates };
    if (totalPrice !== undefined) booking.totalPrice = totalPrice;
    if (source) booking.source = source;
    if (mealPlan) booking.mealPlan = mealPlan;
    if (roomId) booking.room = roomId;

    await booking.save();

    // Send Email if Confirmed
    if (status === 'confirmed') {
        try {
            if (booking.guest && booking.guest.email) {
                await sendEmail({
                    email: booking.guest.email,
                    subject: 'BeyondHeaven - Booking Confirmed! 🌴',
                    message: `Dear ${booking.guest.name},\n\nGreat news! Your stay at ${booking.room.name} has been CONFIRMED.\n\nDates: ${new Date(booking.dates.checkIn).toDateString()} - ${new Date(booking.dates.checkOut).toDateString()}\nTotal Paid: ₹${booking.totalPrice}\n\nWe look forward to welcoming you to paradise.\n\nWarm Regards,\nBeyondHeaven Team`
                });
            }
        } catch (emailError) {
            console.error('Confirmation Email failed:', emailError);
        }
    }

    // Send Email if Cancelled
    if (status === 'cancelled') {
        try {
            if (booking.guest && booking.guest.email) {
                await sendEmail({
                    email: booking.guest.email,
                    subject: 'BeyondHeaven - Booking Cancelled',
                    message: `Dear ${booking.guest.name},\n\nYour booking at ${booking.room.name} for dates ${new Date(booking.dates.checkIn).toDateString()} - ${new Date(booking.dates.checkOut).toDateString()} has been CANCELLED.\n\nIf you did not request this cancellation or have questions, please contact us immediately.\n\nWarm Regards,\nBeyondHeaven Team`
                });
            }
        } catch (emailError) {
            console.error('Cancellation Email failed:', emailError);
        }
    }

    res.status(200).json({ success: true, data: booking });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin)
exports.deleteBooking = asyncHandler(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Send Email before deletion (treating deletion as cancellation)
    try {
        if (booking.guest && booking.guest.email) {
            await sendEmail({
                email: booking.guest.email,
                subject: 'BeyondHeaven - Booking Cancelled',
                message: `Dear ${booking.guest.name},\n\nYour booking at ${booking.room ? booking.room.name : 'BeyondHeaven'} has been CANCELLED and removed from our system.\n\nDates: ${new Date(booking.dates.checkIn).toDateString()} - ${new Date(booking.dates.checkOut).toDateString()}\n\nWarm Regards,\nBeyondHeaven Team`
            });
        }
    } catch (emailError) {
        console.error('Deletion Cancellation Email failed:', emailError);
    }

    await booking.deleteOne();

    res.status(200).json({ success: true, data: {} });
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin)
exports.getBookings = asyncHandler(async (req, res, next) => {
    let query = {};
    const { startDate, endDate, source } = req.query;

    if (startDate && endDate) {
        query['dates.checkIn'] = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    if (source) {
        query.source = source;
    }

    const bookings = await Booking.find(query)
        .populate({
            path: 'room',
            populate: {
                path: 'propertyId'
            }
        })
        .sort('-dates.checkIn');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
});
