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

// export const handleWhatsappWebhook = async (req, res) => {
//   try {
//     const entry = req.body?.entry?.[0];
//     const change = entry?.changes?.[0];
//     const message = change?.value?.messages?.[0];

//     if (!message) {
//       return res.sendStatus(200);
//     }

//     const from = message.from;
//     const text = message.text?.body?.trim();

//     console.log("Incoming WhatsApp:", from, text);

//     await processIncomingMessage({
//       phone: from,
//       text,
//     });

//     res.sendStatus(200);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// };
export const handleWhatsappWebhook = async (req, res) => {
  console.error(
    "WHATSAPP_WEBHOOK",
    JSON.stringify(req.body, null, 2)
  );

  return res.sendStatus(200);
};