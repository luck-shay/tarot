import { sendWhatsAppMessage } from "./whatsappService.js";

export const processIncomingMessage = async ({
  phone,
  text,
}) => {

  if (
    ["1", "2", "3", "4", "5", "6"].includes(text)
  ) {
    return sendWhatsAppMessage({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: {
        body: "🔮 Please type your question.",
      },
    });
  }

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
};