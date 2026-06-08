import crypto from "crypto";
import { razorpayClient } from "../config/razorpayClient.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

export const createPaymentLinkForBooking = async ({ booking, service }) => {
  const amountInPaise = Number(service.price) * 100;

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

  const paymentLink = await razorpayClient.paymentLink.create(paymentLinkPayload);

  return {
    id: paymentLink.id,
    shortUrl: paymentLink.short_url,
  };
};

export const verifyRazorpayWebhookSignature = (rawBody, signature) => {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw new AppError(
      "Webhook secret missing. Set RAZORPAY_WEBHOOK_SECRET in environment.",
      500,
    );
  }

  if (!signature) {
    throw new AppError("Missing Razorpay signature header", 400);
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new AppError("Invalid Razorpay webhook signature", 401);
  }
};
