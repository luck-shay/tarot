import { processIncomingMessage } from "../services/whatsappConversationService.js";

export const handleWhatsappWebhook = async (req, res) => {
  try {
    const message =
      req.body?.entry?.[0]
        ?.changes?.[0]
        ?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const phone = message.from;
    const text = message.text?.body?.trim();

    console.log("Incoming WhatsApp", {
      phone,
      text,
    });

    await processIncomingMessage({
      phone,
      text,
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};