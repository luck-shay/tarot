import dotenv from "dotenv";
import { AppError } from "../utils/appError.js";

dotenv.config();

const requireEnv = (value, name) => {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new AppError(`Missing required environment variable: ${name}`, 500);
	}

	return value.trim();
};

const parsePort = (value) => {
	const port = Number.parseInt(value ?? "3000", 10);

	if (!Number.isInteger(port) || port <= 0) {
		throw new AppError("PORT must be a positive integer", 500);
	}

	return port;
};

const parseUrl = (value, name) => {
	const url = requireEnv(value, name);

	try {
		const parsed = new URL(url);

		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			throw new Error("Invalid protocol");
		}

		return parsed.toString().replace(/\/$/, "");
	} catch {
		throw new AppError(`${name} must be a valid http or https URL`, 500);
	}
};

export const env = Object.freeze({
	PORT: parsePort(process.env.PORT),
	SUPABASE_URL: parseUrl(process.env.SUPABASE_URL, "SUPABASE_URL"),
	SUPABASE_SERVICE_ROLE_KEY: requireEnv(
		process.env.SUPABASE_SERVICE_ROLE_KEY,
		"SUPABASE_SERVICE_ROLE_KEY",
	),
	RAZORPAY_KEY_ID: requireEnv(process.env.RAZORPAY_KEY_ID, "RAZORPAY_KEY_ID"),
	RAZORPAY_KEY_SECRET: requireEnv(
		process.env.RAZORPAY_KEY_SECRET,
		"RAZORPAY_KEY_SECRET",
	),
	RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || "",
	EMAIL_USER: requireEnv(process.env.EMAIL_USER, "EMAIL_USER"),
	EMAIL_PASS: requireEnv(process.env.EMAIL_PASS, "EMAIL_PASS"),
});
