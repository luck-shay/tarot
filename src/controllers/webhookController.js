import { verifyRazorpayWebhookSignature } from "../services/razorpayService.js";
import { processPaymentCapturedWebhook } from "../services/webhookService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  logger.info("[TRACE webhook] entering Razorpay webhook handler", {
    event: req.body?.event,
    hasRawBody: Boolean(req.rawBody),
    hasSignature: Boolean(req.headers["x-razorpay-signature"]),
  });

  if (!req.rawBody) {
    throw new AppError("Missing raw webhook body", 400);
  }

  const signature = req.headers["x-razorpay-signature"];

  verifyRazorpayWebhookSignature(req.rawBody, signature);

  const event = req.body?.event;

  if (event === "payment.captured") {
    logger.info("[TRACE webhook] before processPaymentCapturedWebhook", { event });
    await processPaymentCapturedWebhook(req.body);
    logger.info("[TRACE webhook] after processPaymentCapturedWebhook", { event });
  } else {
    logger.info("Unhandled webhook event received", { event });
  }

  res.status(200).json({
    success: true,
    message: "Webhook processed",
  });
});
