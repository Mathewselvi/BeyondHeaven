const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a room name']
    },
    propertyId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Property',
        required: true
    },
    type: {
        type: String, // e.g., Suite, Standard, Villa
        required: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a (CP) price']
    },
    priceEP: {
        type: Number,
        required: [true, 'Please add an EP price']
    },
    priceMAP: {
        type: Number,
        required: [true, 'Please add a MAP price']
    },
    priceExtraBed: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
    },
    images: {
        type: [String],
        default: []
    },
    quantity: {
        type: Number,
        default: 1
    },
    maxGuests: { // Keeping as maxGuests for compatibility, mapped to Capacity
        type: Number,
        required: [true, 'Please add capacity']
    },
    features: { // Amenities
        type: [String],
        default: []
    },
    unavailableDates: [{
        from: Date,
        to: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', RoomSchema);
