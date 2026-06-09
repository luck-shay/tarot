import { verifyRazorpayWebhookSignature } from "../services/razorpayService.js";
import { processPaymentCapturedWebhook } from "../services/webhookService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  if (!req.rawBody) {
    throw new AppError("Missing raw webhook body", 400);
  }

  const signature = req.headers["x-razorpay-signature"];

  verifyRazorpayWebhookSignature(req.rawBody, signature);

  const event = req.body?.event;

  if (event === "payment.captured") {
    await processPaymentCapturedWebhook(req.body);
  } else {
    logger.info("Unhandled webhook event received", { event });
  }

  res.status(200).json({
    success: true,
    message: "Webhook processed",
  });
});
