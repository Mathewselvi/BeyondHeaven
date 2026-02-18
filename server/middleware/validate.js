const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const message = error.details.map((detail) => detail.message).join(', ');
        return res.status(400).json({ success: false, message });
    }

    next();
};

module.exports = validate;
