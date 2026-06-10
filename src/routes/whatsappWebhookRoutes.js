// routes/whatsappWebhookRoutes.js

import express from "express";
import {
  verifyWhatsappWebhook,
  handleWhatsappWebhook,
} from "../controllers/whatsappWebhookController.js";

const router = express.Router();

router.get("/", verifyWhatsappWebhook);
router.post("/", handleWhatsappWebhook);

export default router;