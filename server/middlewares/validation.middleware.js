import Joi from 'joi';

export const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true
  });

  if (error) {
    const missingFields = error.details
      .filter(detail => detail.type === "any.required")
      .map(detail => detail.context.key);

    return res.status(400).json({ missingFields });
  }

  next();
};