const Message = require('../models/Message');
const asyncHandler = require('../middleware/asyncHandler');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private (Admin)
exports.getMessages = asyncHandler(async (req, res, next) => {
    const messages = await Message.find().sort('-createdAt');
    res.status(200).json({ success: true, count: messages.length, data: messages });
});

// @desc    Create message
// @route   POST /api/messages
// @access  Public
exports.createMessage = asyncHandler(async (req, res, next) => {
    const { name, email, subject, message, phone } = req.body;

    const newMessage = await Message.create({
        name,
        email,
        subject,
        message,
        phone
    });

    // Send email to admin
    const emailMessage = `
        You have received a new message from the contact form:
        \n
        Name: ${name}
        Email: ${email}
        Phone: ${phone || 'Not provided'}
        Subject: ${subject}
        \n
        Message:
        ${message}
    `;

    try {
        await sendEmail({
            email: process.env.SMTP_EMAIL,
            subject: `New Contact Request: ${subject}`,
            message: emailMessage
        });

        // Also send confirmation to user (Optional but good practice)
        /*
        await sendEmail({
            email: email,
            subject: `We received your message: ${subject}`,
            message: `Hi ${name},\n\nThank you for contacting BeyondHeaven. We have received your message and will get back to you shortly.\n\nBest Regards,\nBeyondHeaven Team`
        });
        */

    } catch (err) {
        console.error("Email sending failed:", err);
        // We generally don't want to fail the request if email fails, but maybe log it
    }

    res.status(201).json({ success: true, data: newMessage });
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private (Admin)
exports.deleteMessage = asyncHandler(async (req, res, next) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    await message.deleteOne();
    res.status(200).json({ success: true, data: {} });
});
