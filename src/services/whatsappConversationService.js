import { sendWhatsAppMessage } from "./whatsappService.js";
import { createPaymentLink } from "./paymentService.js";

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

    return sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: {
        body: `🔮 Welcome to House of Arcana

1️⃣ One Question - ₹99
2️⃣ Three Questions - ₹249
3️⃣ Detailed Reading - ₹399
4️⃣ 15 Minute Reading - ₹199
5️⃣ 30 Minute Reading - ₹399
6️⃣ 45 Minute Reading - ₹699

Reply with a number to continue.`,
      },
    });
  }

  if (session.state === "SELECT_SERVICE") {
    console.log("SELECT SERVICE");

    if (!["1", "2", "3", "4", "5", "6"].includes(text)) {
      return sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body:
            "Please choose a number between 1 and 6.",
        },
      });
    }

    await updateSession(phone, {
      state: "ASK_QUESTION",
      selected_service_id: Number(text),
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

    const paymentLink =
      await createPaymentLink(
        phone,
        session.selected_service_id
      );

    await updateSession(phone, {
      state: "PAYMENT_PENDING",
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
      const paymentLink =
        await createPaymentLink(
          phone,
          session.selected_service_id
        );

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