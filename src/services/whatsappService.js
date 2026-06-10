// src/services/whatsappService.js
import { logger } from "../utils/logger.js";

const GRAPH_VERSION = "v25.0";

export const sendWhatsAppMessage = async (payload) => {
  logger.info("Sending WhatsApp message", {
    to: payload.to,
    type: payload.type,
    phoneNumberIdConfigured: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
    accessTokenConfigured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN),
  });

  try {
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

    const responseBody = await response.text();
    let data;

    try {
      data = responseBody ? JSON.parse(responseBody) : null;
    } catch {
      data = responseBody;
    }

    logger.info("WhatsApp API response", {
      to: payload.to,
      status: response.status,
      ok: response.ok,
      body: data,
    });

    if (!response.ok) {
      logger.error("WhatsApp send failed", {
        to: payload.to,
        status: response.status,
        body: data,
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
  } catch (error) {
    logger.error("WhatsApp request threw", {
      to: payload.to,
      message: error.message,
      stack: error.stack,
    });

    throw error;
  }
};

// export const sendOwnerWhatsappNotification = async ({
//   booking,
//   service,
// }) => {
//   return sendWhatsAppMessage({
//     messaging_product: "whatsapp",
//     to: process.env.OWNER_WHATSAPP_NUMBER,
//     // to: booking.customer_phone, // For testing with customer number
//     type: "text",
//     text: {
//       body:
// `🔮 NEW PAID BOOKING

// Customer: ${booking.customer_name}
// Phone: ${booking.customer_phone}

// Service: ${service.name}
// Amount: ₹${service.price}

// Question:
// ${booking.question_details || "N/A"}

// Booking ID: ${booking.id}`
//     }
//   });
// };
// export const sendOwnerWhatsappNotification = async () => {
//   return sendWhatsAppMessage({
//     messaging_product: "whatsapp",
//     to: process.env.OWNER_WHATSAPP_NUMBER,
//     type: "template",
//     template: {
//       name: "hello_world",
//       language: {
//         code: "en_US",
//       },
//     },
//   });
// };
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
export const sendOwnerWhatsappNotification = async () => {
  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    to: process.env.OWNER_WHATSAPP_NUMBER,
    type: "template",
    template: {
      name: "hello_world",
      language: {
        code: "en_US",
      },
    },
  });
};