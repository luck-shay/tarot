import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";
import { getBookingById, markBookingPaid } from "./bookingService.js";
import { sendOwnerPaymentNotification } from "./notificationService.js";
import { getServiceById } from "./serviceCatalogService.js";
import {
  sendOwnerWhatsappNotification,
  sendCustomerWhatsappConfirmation,
} from "./whatsappService.js";
import { sendOwnerWhatsappNotification } from "./whatsappService.js";

const extractBookingIdFromPaymentEntity = (paymentEntity) => {
  if (paymentEntity?.notes?.booking_id) {
    return Number(paymentEntity.notes.booking_id);
  }

  if (paymentEntity?.notes?.bookingId) {
    return Number(paymentEntity.notes.bookingId);
  }

  const description = paymentEntity?.description || "";
  const matched = description.match(/Booking\s*#(\d+)/i);
  if (matched?.[1]) {
    return Number(matched[1]);
  }

  return null;
};

const normalizeAmountFromPaise = (amount) => {
  const normalizedAmount = Number(amount);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new AppError("Invalid payment amount in webhook payload", 400);
  }

  return Number((normalizedAmount / 100).toFixed(2));
};

const assertPaymentMatchesBooking = ({ booking, service, paymentEntity, amountPaid }) => {
  if (paymentEntity.status && paymentEntity.status !== "captured") {
    throw new AppError("Webhook payment is not captured", 400);
  }

  if (paymentEntity.currency && paymentEntity.currency !== "INR") {
    throw new AppError("Webhook payment currency mismatch", 400);
  }

  const expectedAmount = Number(service.price);

  if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
    throw new AppError("Invalid service price for booking", 500);
  }

  if (amountPaid !== Number(expectedAmount.toFixed(2))) {
    throw new AppError("Webhook payment amount mismatch", 400, {
      bookingId: booking.id,
      expectedAmount,
      paidAmount: amountPaid,
    });
  }

  if (
    booking.payment_status === "paid" &&
    booking.razorpay_payment_id &&
    booking.razorpay_payment_id !== paymentEntity.id
  ) {
    throw new AppError("Booking is already paid with a different payment", 409);
  }
};

export const processPaymentCapturedWebhook = async (eventBody) => {
  const paymentEntity = eventBody?.payload?.payment?.entity;

  if (!paymentEntity) {
    throw new AppError("Invalid webhook payload for payment.captured", 400);
  }

  const bookingId = extractBookingIdFromPaymentEntity(paymentEntity);

  if (!bookingId || Number.isNaN(bookingId)) {
    throw new AppError("Unable to resolve booking id from payment payload", 400);
  }

  const booking = await getBookingById(bookingId);
  const service = await getServiceById(booking.service_id);
  const amountPaid = normalizeAmountFromPaise(paymentEntity.amount);

  assertPaymentMatchesBooking({ booking, service, paymentEntity, amountPaid });

  if (booking.payment_status === "paid") {
    logger.info("Duplicate payment.captured webhook ignored", {
      bookingId,
      razorpayPaymentId: paymentEntity.id,
    });
    return booking;
  }

  const updatedBooking = await markBookingPaid({
    bookingId,
    razorpayPaymentId: paymentEntity.id,
    amountPaid,
  });

  try {
  await sendOwnerWhatsappNotification({
    booking: updatedBooking,
    service,
  });
} catch (error) {
  logger.error("Owner WhatsApp failed", error);
}

try {
  await sendCustomerWhatsappConfirmation({
    booking: updatedBooking,
    service,
  });
} catch (error) {
  logger.error("Customer WhatsApp failed", error);
}

  const emailSent = await sendOwnerPaymentNotification({ booking: updatedBooking, service });

  if (!emailSent) {
    logger.warn("Payment notification email was not sent", {
      bookingId,
      razorpayPaymentId: paymentEntity.id,
    });
  }

  logger.info("Booking marked paid from webhook", {
    bookingId,
    paymentId: paymentEntity.id,
  });

  return updatedBooking;
};
