import express from "express";
import { createBooking } from "../controllers/bookingsController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { validateCreateBookingPayload } from "../utils/validators.js";

const router = express.Router();

router.post("/", validateRequest(validateCreateBookingPayload), createBooking);

export { router as bookingsRoutes };
