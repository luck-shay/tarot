import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";
import { getBookingById, markBookingPaid } from "./bookingService.js";
import { sendOwnerPaymentNotification } from "./notificationService.js";
import { getServiceById } from "./serviceCatalogService.js";

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
    amountPaid: Number(paymentEntity.amount) / 100,
  });

  const service = await getServiceById(updatedBooking.service_id);
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
