import { verifyRazorpayWebhookSignature } from "../services/razorpayService.js";
import { processPaymentCapturedWebhook } from "../services/webhookService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
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
