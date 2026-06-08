const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

export const validateCreateBookingPayload = (payload) => {
  const errors = [];

  if (!isNonEmptyString(payload.customer_name)) {
    errors.push("customer_name is required");
  }

  if (!isNonEmptyString(payload.customer_phone)) {
    errors.push("customer_phone is required");
  }

  if (!Number.isInteger(payload.service_id) || payload.service_id <= 0) {
    errors.push("service_id must be a positive integer");
  }

  if (payload.question_details !== undefined && typeof payload.question_details !== "string") {
    errors.push("question_details must be a string");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      customer_name: (payload.customer_name || "").trim(),
      customer_phone: (payload.customer_phone || "").trim(),
      service_id: payload.service_id,
      question_details: payload.question_details?.trim() || null,
    },
  };
};
