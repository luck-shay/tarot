import { AppError } from "../utils/appError.js";

export const validateRequest = (validator) => (req, _res, next) => {
  const result = validator(req.body);

  if (!result.isValid) {
    return next(new AppError("Validation failed", 400, result.errors));
  }

  req.validatedBody = result.sanitizedData;
  return next();
};
