import express from "express";
import { createBooking } from "../controllers/bookingsController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateCreateBookingPayload } from "../utils/validators.js";

const router = express.Router();

router.post("/", validateRequest(validateCreateBookingPayload), createBooking);

export { router as bookingsRoutes };
import { sendOwnerWhatsappNotification } from "../services/whatsappService.js";

router.get("/test-whatsapp", async (_req, res) => {
  try {
    const result = await sendOwnerWhatsappNotification({
      booking: {
        id: 999,
        customer_name: "Lakshay",
        customer_phone: "9548457345",
        question_details: "Direct WhatsApp Test",
      },
      service: {
        name: "1 Question",
        price: 99,
      },
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});