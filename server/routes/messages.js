const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Joi = require('joi');
const validate = require('../middleware/validate');
const { getMessages, createMessage, deleteMessage } = require('../controllers/messageController');

const messageSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
    phone: Joi.string().optional().allow('')
});

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin'), getMessages)
    .post(validate(messageSchema), createMessage);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteMessage);

module.exports = router;
