import { env } from "../config/env.js";
import { transporter } from "../config/mailer.js";
import { logger } from "../utils/logger.js";

const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildPaymentNotification = ({ booking, service }) => {
  const amount = booking.amount_paid ?? service.price;

  return {
    subject: `Payment received for Booking #${booking.id}`,
    text: [
      "A new booking payment has been confirmed.",
      `Booking ID: ${booking.id}`,
      `Customer Name: ${booking.customer_name}`,
      `Phone: ${booking.customer_phone}`,
      `Service Name: ${service.name}`,
      `Amount: ${formatCurrency(amount)}`,
    ].join("\n"),
    html: `
      <h2>Payment received</h2>
      <p>A new booking payment has been confirmed.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${escapeHtml(booking.id)}</li>
        <li><strong>Customer Name:</strong> ${escapeHtml(booking.customer_name)}</li>
        <li><strong>Phone:</strong> ${escapeHtml(booking.customer_phone)}</li>
        <li><strong>Service Name:</strong> ${escapeHtml(service.name)}</li>
        <li><strong>Amount:</strong> ${formatCurrency(amount)}</li>
      </ul>
    `,
  };
};

export const sendOwnerPaymentNotification = async ({ booking, service }) => {
  const message = buildPaymentNotification({ booking, service });

  try {
    await transporter.sendMail({
      from: env.EMAIL_USER,
      to: env.EMAIL_USER,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    logger.info("Owner payment notification email sent", {
      bookingId: booking.id,
    });

    return true;
  } catch (error) {
    logger.error("Failed to send owner payment notification email", {
      bookingId: booking.id,
      message: error.message,
    });

    return false;
  }
};
