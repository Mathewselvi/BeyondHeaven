const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a property name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    amenities: {
        type: [String],
        required: true
    },
    images: {
        type: [String], // Array of image URLs
        default: []
    },
    contactInfo: {
        phone: String,
        email: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Reverse populate with virtuals
PropertySchema.virtual('rooms', {
    ref: 'Room',
    localField: '_id',
    foreignField: 'propertyId',
    justOne: false
});

module.exports = mongoose.model('Property', PropertySchema);
