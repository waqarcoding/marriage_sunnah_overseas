const Joi = require('joi');
exports.validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,   // validate all fields
    allowUnknown: true   // ignore extra fields
  });

  if (error) {
    // Only include missing required fields
    const missingFields = error.details
      .filter(detail => detail.type === "any.required")
      .map(detail => detail.context.key);

    return res.status(400).json({ missingFields });
  }

  next();
};
