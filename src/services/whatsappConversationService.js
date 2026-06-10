import { sendWhatsAppMessage } from "./whatsappService.js";

const sessions = new Map();

export const processIncomingMessage = async ({
  phone,
  text,
}) => {
  const state = sessions.get(phone);

  if (!state) {
    sessions.set(phone, {
      step: "SELECT_SERVICE",
    });

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

  if (state.step === "SELECT_SERVICE") {
    if (!["1", "2", "3", "4", "5", "6"].includes(text)) {
      return sendWhatsAppMessage({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body: "Please choose a number between 1 and 6.",
        },
      });
    }

    sessions.set(phone, {
      step: "ASK_QUESTION",
      service: text,
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

  if (state.step === "ASK_QUESTION") {
    sessions.set(phone, {
      step: "PAYMENT_PENDING",
      service: state.service,
      question: text,
    });

    return sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: {
        body: `Question received.

Next step:
Generate Razorpay payment link here.`,
      },
    });
  }
};