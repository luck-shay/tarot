import { supabase } from "../config/supabaseClient.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";
import { createPaymentLinkForBooking } from "./razorpayService.js";
import { getServiceById } from "./serviceCatalogService.js";

export const createBookingWithPaymentLink = async (payload) => {
  const service = await getServiceById(payload.service_id);

  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      service_id: payload.service_id,
      question_details: payload.question_details,
      payment_status: "pending",
      booking_status: "awaiting_payment",
    })
    .select("id, customer_name, customer_phone, service_id, payment_status, booking_status")
    .single();

  if (insertError || !booking) {
    throw new AppError("Failed to create booking", 500, insertError?.message);
  }

  logger.info("Booking created", { bookingId: booking.id, serviceId: service.id });

  const paymentLink = await createPaymentLinkForBooking({ booking, service });

  logger.info("Razorpay payment link created", {
    bookingId: booking.id,
    paymentLinkId: paymentLink.id,
  });

  return {
    bookingId: booking.id,
    paymentLink: paymentLink.shortUrl,
  };
};

export const getBookingById = async (bookingId) => {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, customer_name, customer_phone, service_id, payment_status, booking_status, razorpay_payment_id, amount_paid",
    )
    .eq("id", bookingId)
    .single();

  if (error || !data) {
    throw new AppError("Booking not found", 404);
  }

  return data;
};

export const markBookingPaid = async ({ bookingId, razorpayPaymentId, amountPaid }) => {
  const { data, error } = await supabase
    .from("bookings")
    .update({
      payment_status: "paid",
      booking_status: "awaiting_confirmation",
      razorpay_payment_id: razorpayPaymentId,
      amount_paid: amountPaid,
    })
    .eq("id", bookingId)
    .select("id, customer_name, customer_phone, service_id, payment_status, booking_status, amount_paid")
    .single();

  if (error || !data) {
    throw new AppError("Failed to update booking after payment", 500, error?.message);
  }

  return data;
};
