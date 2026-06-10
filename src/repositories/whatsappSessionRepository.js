import { supabase } from "../config/supabase.js";

export const getSession = async (phone) => {
  const { data, error } = await supabase
    .from("whatsapp_sessions")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error) {
    console.error(
      "GET SESSION ERROR",
      error
    );
  }

  console.log("GET SESSION", {
    phone,
    data,
  });

  return data;
};

export const createSession = async (
  phone,
  state,
  selectedServiceId = null
) => {
  const { data, error } = await supabase
    .from("whatsapp_sessions")
    .upsert({
      phone,
      state,
      selected_service_id: selectedServiceId,
    })
    .select();

  if (error) {
    console.error(
      "CREATE SESSION ERROR",
      error
    );
  }

  console.log("CREATE SESSION", {
    phone,
    state,
    selectedServiceId,
    data,
  });

  return data;
};

export const updateSession = async (
  phone,
  updates
) => {
  const { data, error } = await supabase
    .from("whatsapp_sessions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("phone", phone)
    .select();

  if (error) {
    console.error(
      "UPDATE SESSION ERROR",
      error
    );
  }

  console.log("UPDATE SESSION", {
    phone,
    updates,
    data,
  });

  return data;
};

export const deleteSession = async (
  phone
) => {
  const { data, error } = await supabase
    .from("whatsapp_sessions")
    .delete()
    .eq("phone", phone)
    .select();

  if (error) {
    console.error(
      "DELETE SESSION ERROR",
      error
    );
  }

  console.log("DELETE SESSION", {
    phone,
    data,
  });

  return data;
};