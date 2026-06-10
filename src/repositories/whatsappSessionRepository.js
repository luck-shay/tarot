// whatsappSessionRepository.js

import { supabase } from "../config/supabase.js";

export const getSession = async (phone) => {
  const { data } = await supabase
    .from("whatsapp_sessions")
    .select("*")
    .eq("phone", phone)
    .single();

  return data;
};

export const createSession = async (
  phone,
  state,
  selectedServiceId = null
) => {
  return supabase
    .from("whatsapp_sessions")
    .upsert({
      phone,
      state,
      selected_service_id: selectedServiceId,
    });
};

export const updateSession = async (
  phone,
  updates
) => {
  return supabase
    .from("whatsapp_sessions")
    .update({
      ...updates,
      updated_at: new Date(),
    })
    .eq("phone", phone);
};

export const deleteSession = async (
  phone
) => {
  return supabase
    .from("whatsapp_sessions")
    .delete()
    .eq("phone", phone);
};