import { transporter } from "../config/mailer.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const sendOwnerPaymentNotification = async ({ booking, service }) => {
  const subject = `New Paid Booking - House of Arcana (#${booking.id})`;
  const text = [
    "A booking payment was completed.",
    "",
    `Booking ID: ${booking.id}`,
    `Customer Name: ${booking.customer_name}`,
    `Phone: ${booking.customer_phone}`,
    `Service: ${service.name}`,
    `Amount: INR ${booking.amount_paid}`,
  ].join("\n");

  await transporter.sendMail({
    from: env.EMAIL_USER,
    to: env.EMAIL_USER,
    subject,
    text,
  });

  logger.info("Payment notification email sent", { bookingId: booking.id });
};
