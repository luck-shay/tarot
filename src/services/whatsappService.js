// src/services/whatsappService.js
import { logger } from "../utils/logger.js";

const GRAPH_VERSION = "v25.0";

const sendWhatsAppMessage = async (payload) => {
  logger.info("Sending WhatsApp message", {
    to: payload.to,
    type: payload.type,
  });

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    logger.error("WhatsApp send failed", {
      to: payload.to,
      status: response.status,
      error: data,
    });

    throw new Error(
      `WhatsApp API Error: ${JSON.stringify(data)}`
    );
  }

  logger.info("WhatsApp message sent", {
    to: payload.to,
    messageId: data?.messages?.[0]?.id,
  });

  return data;
};

export const sendOwnerWhatsappNotification = async ({
  booking,
  service,
}) => {
  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    to: process.env.OWNER_WHATSAPP_NUMBER,
    // to: booking.customer_phone, // For testing with customer number
    type: "text",
    text: {
      body:
`🔮 NEW PAID BOOKING

Customer: ${booking.customer_name}
Phone: ${booking.customer_phone}

Service: ${service.name}
Amount: ₹${service.price}

Question:
${booking.question_details || "N/A"}

Booking ID: ${booking.id}`
    }
  });
};

export const sendCustomerWhatsappConfirmation = async ({
  booking,
  service,
}) => {
  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    to: booking.customer_phone,
    type: "text",
    text: {
      body:
`🔮 House of Arcana

Your payment has been received successfully.

Service: ${service.name}
Booking ID: ${booking.id}

We will contact you shortly on WhatsApp regarding your reading.

Thank you for choosing House of Arcana ✨`
    }
  });
};