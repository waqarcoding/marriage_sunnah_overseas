import Joi from 'joi';

export const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    const errors = {};

    error.details.forEach(detail => {
      const field = detail.context?.key || detail.path?.join('.') || 'unknown';
      // Human readable message
      errors[field] = detail.message
        .replace(/['"]/g, '')
        .replace(`${field} `, '')
        .trim();
    });

    // Also keep missingFields array for backward compatibility
    const missingFields = error.details
      .filter(d => d.type === 'any.required')
      .map(d => d.context.key);

    return res.status(400).json({
      success: false,
      message: 'Joi Validation failed',
      errors,          // { name: 'is required', email: 'must be a valid email' }
      missingFields,   // ['name', 'email'] — backward compat
    });
  }

  next();
};