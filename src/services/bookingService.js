import { supabase } from "../config/supabaseClient.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";
import { createPaymentLinkForBooking } from "./razorpayService.js";
import { getServiceById } from "./serviceCatalogService.js";

const bookingSelectFields =
  "id, customer_name, customer_phone, service_id, appointment_date, appointment_time, payment_status, booking_status, notes, created_at, razorpay_payment_id, amount_paid, question_details";

export const createBookingWithPaymentLink = async (payload) => {
  const service = await getServiceById(payload.service_id);

  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      service_id: payload.service_id,
      appointment_date: null,
      appointment_time: null,
      question_details: payload.question_details,
      payment_status: "pending",
      booking_status: "awaiting_payment",
    })
    .select(bookingSelectFields)
    .single();

  if (insertError || !booking) {
    throw new AppError("Failed to create booking", 500, insertError?.message);
  }

  logger.info("Booking created", {
    bookingId: booking.id,
    serviceId: service.id,
    customerPhone: booking.customer_phone,
  });

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
  const normalizedBookingId = Number(bookingId);

  if (!Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
    throw new AppError("Invalid booking id", 400);
  }

  const { data, error } = await supabase
    .from("bookings")
    .select(bookingSelectFields)
    .eq("id", normalizedBookingId)
    .maybeSingle();

  if (error) {
    throw new AppError("Failed to fetch booking", 500, error.message);
  }

  if (!data) {
    throw new AppError("Booking not found", 404);
  }

  return data;
};

export const markBookingPaid = async ({ bookingId, razorpayPaymentId, amountPaid }) => {
  const normalizedBookingId = Number(bookingId);
  const normalizedAmountPaid = Number(amountPaid);

  if (!Number.isInteger(normalizedBookingId) || normalizedBookingId <= 0) {
    throw new AppError("Invalid booking id", 400);
  }

  if (!Number.isFinite(normalizedAmountPaid) || normalizedAmountPaid < 0) {
    throw new AppError("Invalid amount paid", 400);
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({
      payment_status: "paid",
      booking_status: "awaiting_confirmation",
      razorpay_payment_id: razorpayPaymentId,
      amount_paid: Number(normalizedAmountPaid.toFixed(2)),
    })
    .eq("id", normalizedBookingId)
    .select(bookingSelectFields)
    .maybeSingle();

  if (error) {
    throw new AppError("Failed to update booking after payment", 500, error?.message);
  }

  if (!data) {
    throw new AppError("Booking not found", 404);
  }

  logger.info("Booking marked as paid", {
    bookingId: data.id,
    razorpayPaymentId,
    amountPaid: data.amount_paid,
  });

  return data;
};
