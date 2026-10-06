import { validationResult } from 'express-validator';

/**
 * Runs after express-validator checks. Returns 400 with all errors if any.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  return res.status(400).json({
    message: 'Validation failed',
    errors: formatted,
  });
};