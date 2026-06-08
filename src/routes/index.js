import express from "express";
import { createBooking } from "../controllers/bookingsController.js";
import { getHealth } from "../controllers/healthController.js";
import { listServices } from "../controllers/servicesController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateCreateBookingPayload } from "../utils/validators.js";

const router = express.Router();

router.get("/health", getHealth);
router.get("/services", listServices);
router.post("/bookings", validateRequest(validateCreateBookingPayload), createBooking);

export default router;
