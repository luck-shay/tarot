import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    logger.warn("Malformed JSON payload received", {
      message: error.message,
    });

    return res.status(400).json({
      success: false,
      message: "Malformed JSON payload",
    });
  }

  if (error instanceof AppError) {
    logger.warn(error.message, { details: error.details });
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.details,
    });
  }

  logger.error("Unhandled server error", {
    message: error.message,
    stack: error.stack,
  });

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
