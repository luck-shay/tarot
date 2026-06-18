import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { getHealth } from "./controllers/healthController.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import apiRoutes from "./routes/index.js";
import { webhookRoutes } from "./routes/webhookRoutes.js";
import { logger } from "./utils/logger.js";
import whatsappWebhookRoutes from "./routes/whatsappWebhookRoutes.js";
const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(
	express.json({
		limit: "1mb",
		verify: (req, _res, buffer) => {
			req.rawBody = buffer;
		},
	}),
);
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api/webhooks", webhookRoutes);
app.use("/api/webhooks/whatsapp", whatsappWebhookRoutes);
app.use("/api", apiRoutes);
// Keep a copy of the raw request body so Razorpay webhook signatures can be verified.



app.get("/", getHealth);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
	logger.info(`Server running on port ${env.PORT}`);
});