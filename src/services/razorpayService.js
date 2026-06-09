import crypto from "crypto";
import { razorpayClient } from "../config/razorpayClient.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

export const createPaymentLinkForBooking = async ({ booking, service }) => {
  const amountInRupees = Number(service.price);

  if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
    throw new AppError("Invalid service price", 500);
  }

  const amountInPaise = Math.round(amountInRupees * 100);

  const paymentLinkPayload = {
    amount: amountInPaise,
    currency: "INR",
    accept_partial: false,
    reference_id: `booking-${booking.id}`,
    description: `House of Arcana - ${service.name} (Booking #${booking.id})`,
    customer: {
      name: booking.customer_name,
      contact: booking.customer_phone,
    },
    notify: {
      sms: true,
      email: false,
    },
    reminder_enable: true,
    notes: {
      booking_id: String(booking.id),
      service_name: service.name,
    },
  };

  try {
    const paymentLink = await razorpayClient.paymentLink.create(paymentLinkPayload);

    return {
      id: paymentLink.id,
      shortUrl: paymentLink.short_url,
    };
  } catch (error) {
  console.error("RAZORPAY ERROR:");
  console.error(error);

  logger.error("Failed to create Razorpay payment link", {
    bookingId: booking.id,
    message: error.message,
    error,
  });

  throw new AppError(
    "Failed to create Razorpay payment link",
    502,
    JSON.stringify(error?.error || error)
  );
}
};

export const verifyRazorpayWebhookSignature = (rawBody, signature) => {
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new AppError("Webhook secret missing. Set RAZORPAY_WEBHOOK_SECRET in environment.", 500);
  }

  if (!signature) {
    throw new AppError("Missing Razorpay signature header", 400);
  }

  const rawBuffer = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody ?? "");
  const providedSignature = Array.isArray(signature) ? signature[0] : signature;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBuffer)
    .digest("hex");

  const signatureBuffer = Buffer.from(providedSignature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new AppError("Invalid Razorpay webhook signature", 401);
  }
};
