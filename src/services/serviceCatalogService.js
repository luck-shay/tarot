import { supabase } from "../config/supabaseClient.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

const canonicalServices = Object.freeze([
	{ id: 1, name: "1 Question", category: "text", price: 99, duration_minutes: 0 },
	{ id: 2, name: "3 Questions", category: "text", price: 249, duration_minutes: 0 },
	{ id: 3, name: "Detailed Reading", category: "text", price: 399, duration_minutes: 0 },
	{ id: 4, name: "15 Minute Reading", category: "video", price: 199, duration_minutes: 15 },
	{ id: 5, name: "30 Minute Reading", category: "video", price: 399, duration_minutes: 30 },
	{ id: 6, name: "45 Minute Reading", category: "video", price: 699, duration_minutes: 45 },
]);

const normalizeService = (service) => ({
	id: Number(service.id),
	name: String(service.name),
	category: String(service.category),
	price: Number(service.price),
	duration_minutes: Number(service.duration_minutes ?? 0),
});

const fetchServicesFromSupabase = async () => {
	const { data, error } = await supabase
		.from("services")
		.select("id, name, category, price, duration_minutes")
		.order("id", { ascending: true });

	if (error) {
		logger.warn("Falling back to canonical service catalog", {
			message: error.message,
		});
		return null;
	}

	if (!Array.isArray(data) || data.length === 0) {
		return null;
	}

	return data.map(normalizeService);
};

export const getAllServices = async () => {
	const services = await fetchServicesFromSupabase();
	return services ?? canonicalServices;
};

export const getServiceById = async (serviceId) => {
	const normalizedServiceId = Number(serviceId);

	if (!Number.isInteger(normalizedServiceId) || normalizedServiceId <= 0) {
		throw new AppError("Invalid service id", 400);
	}

	const { data, error } = await supabase
		.from("services")
		.select("id, name, category, price, duration_minutes")
		.eq("id", normalizedServiceId)
		.maybeSingle();

	if (data) {
		return normalizeService(data);
	}

	if (error) {
		logger.warn("Falling back to canonical service lookup", {
			serviceId: normalizedServiceId,
			message: error.message,
		});
	}

	const fallbackService = canonicalServices.find((service) => service.id === normalizedServiceId);

	if (!fallbackService) {
		throw new AppError("Service not found", 404);
	}

	return fallbackService;
};
