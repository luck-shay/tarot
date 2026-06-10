import { processIncomingMessage } from "../services/whatsappConversationService.js";

export const verifyWhatsappWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

export const handleWhatsappWebhook = async (req, res) => {
  try {
    console.log(
      "WHATSAPP_WEBHOOK",
      JSON.stringify(req.body, null, 2)
    );

    const value =
      req.body?.entry?.[0]
        ?.changes?.[0]
        ?.value;

    if (!value) {
      return res.sendStatus(200);
    }

    // Ignore delivery/read/status updates
    if (!value.messages || !Array.isArray(value.messages)) {
      console.log("Ignoring non-message webhook");
      return res.sendStatus(200);
    }

    const message = value.messages[0];

    if (!message) {
      return res.sendStatus(200);
    }

    console.log("MESSAGE TYPE:", message.type);

    // Only process text messages
    if (message.type !== "text") {
      console.log("Ignoring non-text message");
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
    console.error("WHATSAPP WEBHOOK ERROR", error);

    return res.sendStatus(500);
  }
};