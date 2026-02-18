const express = require('express');
const { checkAvailability, createBooking, getBookings, updateBooking, deleteBooking } = require('../controllers/bookingController');
// Import protect logic if we want to secure it.
// Ideally we should import { protect, authorize } from '../middleware/auth'
// But user didn't ask for full security yet, just the feature. Let's add it safe.
const { protect, authorize } = require('../middleware/auth');
const Joi = require('joi');
const validate = require('../middleware/validate');

const bookingSchema = Joi.object({
    roomId: Joi.string().required(),
    checkIn: Joi.date().required(),
    checkOut: Joi.date().greater(Joi.ref('checkIn')).required(),
    guests: Joi.object({
        adults: Joi.number().min(1).required(),
        children: Joi.number().min(0),
        extraBeds: Joi.number().min(0).default(0)
    }).required(), // Allow object
    guest: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required()
    }).required(),
    mealPlan: Joi.string().valid('EP', 'CP', 'MAP').default('CP'),
    totalAmount: Joi.number().optional(),
    source: Joi.string().optional(),
    advanceAmount: Joi.number().optional()
});

const router = express.Router();

router.post('/check-availability', checkAvailability);
router.post('/', validate(bookingSchema), createBooking);
router.get('/', protect, authorize('admin'), getBookings);
router.put('/:id', protect, authorize('admin'), updateBooking);
router.delete('/:id', protect, authorize('admin'), deleteBooking);

module.exports = router;
