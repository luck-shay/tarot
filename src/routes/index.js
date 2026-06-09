import express from "express";
import { getHealth } from "../controllers/healthController.js";
import { bookingsRoutes } from "./bookingsRoutes.js";
import { servicesRoutes } from "./servicesRoutes.js";

const router = express.Router();

router.get("/health", getHealth);
router.use("/services", servicesRoutes);
router.use("/bookings", bookingsRoutes);

export default router;
