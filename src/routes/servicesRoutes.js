import express from "express";
import { listServices } from "../controllers/servicesController.js";

const router = express.Router();

router.get("/", listServices);

export { router as servicesRoutes };
