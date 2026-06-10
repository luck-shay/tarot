import { supabase } from "../config/supabase.js";

export const getSession = async (phone) => {
  if (error) {
  console.error(
    "GET SESSION ERROR",
    error
  );
}
  const { data, error } = await supabase
    .from("whatsapp_sessions")
    .select("*")
    .eq("phone", phone)
    .single();

  console.log("GET SESSION", {
    phone,
    data,
    error,
  });

  return data;
};

// export const createSession = async (
//   phone,
//   state,
//   selectedServiceId = null
// ) => {
//   const { data, error } = await supabase
//     .from("whatsapp_sessions")
//     .upsert({
//       phone,
//       state,
//       selected_service_id: selectedServiceId,
//     })
//     .select();

//   console.log("CREATE SESSION", {
//     phone,
//     state,
//     selectedServiceId,
//     data,
//     error,
//   });

//   return data;
// };

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

  console.log("CREATE SESSION", {
    phone,
    state,
    selectedServiceId,
  });

  if (error) {
    console.error(
      "CREATE SESSION ERROR",
      error
    );
  }

  return data;
};

export const updateSession = async (
  phone,
  updates
) => {
  if (error) {
  console.error(
    "GET SESSION ERROR",
    error
  );
}
  const { data, error } = await supabase
    .from("whatsapp_sessions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("phone", phone)
    .select();

  console.log("UPDATE SESSION", {
    phone,
    updates,
    data,
    error,
  });

  return data;
};

export const deleteSession = async (phone) => {
  const { data, error } = await supabase
    .from("whatsapp_sessions")
    .delete()
    .eq("phone", phone)
    .select();

  console.log("DELETE SESSION", {
    phone,
    data,
    error,
  });

  return data;
};