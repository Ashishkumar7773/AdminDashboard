const Joi = require("joi");

const validate = (schema, source = "body") => (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false });
    if (error) {
        return res.status(400).json({ message: error.details.map(d => d.message).join(", ") });
    }
    // Replace req[source] with validated value (incl. defaults)
    req[source] = value;
    next();
};

module.exports = validate;
