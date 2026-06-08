import { supabase } from "../config/supabaseClient.js";
import { AppError } from "../utils/appError.js";

export const getAllServices = async () => {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, category, price, duration_minutes")
    .order("id", { ascending: true });

  if (error) {
    throw new AppError("Failed to fetch services", 500, error.message);
  }

  return data;
};

export const getServiceById = async (serviceId) => {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, category, price, duration_minutes")
    .eq("id", serviceId)
    .single();

  if (error || !data) {
    throw new AppError("Service not found", 404);
  }

  return data;
};
