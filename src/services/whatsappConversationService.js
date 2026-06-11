import { sendWhatsAppMessage } from "./whatsappService.js";
import { createBookingWithPaymentLink, getBookingById } from "./bookingService.js";
import { createPaymentLinkForBooking } from "./razorpayService.js";
import { getServiceById } from "./serviceCatalogService.js";

import {
  getSession,
  createSession,
  updateSession,
  deleteSession,
} from "../repositories/whatsappSessionRepository.js";

export const processIncomingMessage = async ({
  phone,
  text,
}) => {
  text = text?.trim();

  console.log("MESSAGE RECEIVED", {
    phone,
    text,
  });

  if (
    text &&
    [
      "cancel",
      "reset",
      "restart",
      "start over",
    ].includes(text.toLowerCase())
  ) {
    console.log("CANCELLING SESSION", phone);

    await deleteSession(phone);

    return sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: {
        body: `🔮 Session cancelled.

Send any message to start a new booking.`,
      },
    });
  }

  const session = await getSession(phone);

  console.log("CURRENT SESSION", session);

  if (!session) {
  console.log("FIRST MESSAGE");

  await createSession(
    phone,
    "SELECT_SERVICE"
  );

  await sendWhatsAppMessage({
    messaging_product: "whatsapp",
    to: phone,
    type: "image",
    image: {
      link: process.env.MENU_IMAGE_URL,
    },
  });

  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    to: phone,
    type: "text",
    text: {
      body: `🔮 Welcome to House of Arcana

Please choose a service by replying with the corresponding number:

1️⃣ Audio Reading - One Question (₹199)
2️⃣ Audio Reading - Three Questions (₹333)
3️⃣ Audio Reading - Love Reading (₹399)
4️⃣ Audio Reading - Career Reading (₹399)
5️⃣ Audio Reading - Detailed General Reading (₹555)

6️⃣ Voice Call - One Question (₹299)
7️⃣ Voice Call - Three Questions (₹444)
8️⃣ Voice Call - Love Reading (₹555)
9️⃣ Voice Call - Career Reading (₹555)
🔟 Voice Call - Detailed General Reading (₹666)

1️⃣1️⃣ Video Call - 15 Minutes (₹555)
1️⃣2️⃣ Video Call - 30 Minutes (₹777)
1️⃣3️⃣ Video Call - Detailed Session (₹999)

1️⃣4️⃣ Personal Meetup - 30 Minutes (₹999)
1️⃣5️⃣ Personal Meetup - 60 Minutes (₹1555)

1️⃣6️⃣ Couple Reading (₹699)
1️⃣7️⃣ Monthly Guidance Package (₹999)

Reply with a number to continue.`,
    },
  });
}

  if (session.state === "SELECT_SERVICE") {
    console.log("SELECT SERVICE");

    const selectedService = Number(text);

    if (
      Number.isNaN(selectedService) ||
      selectedService < 1 ||
      selectedService > 17
    ) {
      return sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body: "Please choose a number between 1 and 17.",
        },
      });
    }

    await updateSession(phone, {
      state: "ASK_QUESTION",
      selected_service_id: selectedService,
    });

    return sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: {
        body: "🔮 Please type your question.",
      },
    });
  }

  if (session.state === "ASK_QUESTION") {
    console.log("ASK QUESTION");

    const { bookingId, paymentLink } = await createBookingWithPaymentLink({
      customer_name: "WhatsApp User",
      customer_phone: phone,
      service_id: session.selected_service_id,
      question_details: text,
    });

    await updateSession(phone, {
      state: "PAYMENT_PENDING",
      booking_id: bookingId,
    });

    return sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: {
        body: `🔮 Booking Created

Complete payment here:

${paymentLink}

After payment you'll receive confirmation automatically.

Type CANCEL anytime to start over.`,
      },
    });
  }

  if (session.state === "PAYMENT_PENDING") {
    console.log("PAYMENT PENDING");

    if (
      text &&
      text.toLowerCase() === "pay"
    ) {
      if (!session.booking_id) {
        return sendWhatsAppMessage({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: {
            body: "Your booking could not be found. Please type CANCEL and start again.",
          },
        });
      }

      const booking = await getBookingById(session.booking_id);
      const service = await getServiceById(booking.service_id);
      const { shortUrl: paymentLink } = await createPaymentLinkForBooking({
        booking,
        service,
      });

      return sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body: `Payment link:

${paymentLink}`,
        },
      });
    }

    return sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: {
        body: `Your payment is still pending.

Type:

• PAY to receive the payment link again
• CANCEL to start over`,
      },
    });
  }

  console.log("UNKNOWN STATE", session);

  await deleteSession(phone);

  return sendWhatsAppMessage({
    messaging_product: "whatsapp",
    to: phone,
    type: "text",
    text: {
      body:
        "Something went wrong. Session reset. Send any message to start again.",
    },
  });
};