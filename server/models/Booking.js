const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    // Removed User Ref linkage for Guest Checkout flow
    /* user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }, */
    guest: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    room: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true
    },
    dates: {
        checkIn: {
            type: Date,
            required: true
        },
        checkOut: {
            type: Date,
            required: true
        }
    },
    mealPlan: {
        type: String,
        enum: ['EP', 'CP', 'MAP'],
        default: 'CP',
        required: true
    },
    guests: {
        adults: { type: Number, default: 1 },
        children: { type: Number, default: 0 },
        extraBeds: { type: Number, default: 0 }
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentId: {
        type: String // Optional: Stripe ID or "Manual"
    },
    source: {
        type: String,
        default: 'site' // 'site', 'walk-in', 'phone', 'booking.com', etc.
    },
    advanceAmount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
