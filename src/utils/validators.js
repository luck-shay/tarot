const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const parsePositiveInteger = (value) => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && /^[0-9]+$/.test(value.trim())) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
};

const isValidPhoneNumber = (value) => {
  if (!isNonEmptyString(value)) {
    return false;
  }

  const trimmed = value.trim();
  if (!/^[0-9+\-()\s]+$/.test(trimmed)) {
    return false;
  }

  const digitCount = (trimmed.match(/\d/g) || []).length;
  return digitCount >= 8;
};

export const validateCreateBookingPayload = (payload) => {
  const errors = [];

  if (!isPlainObject(payload)) {
    return {
      isValid: false,
      errors: ["Request body must be a JSON object"],
      sanitizedData: {},
    };
  }

  const customerName = isNonEmptyString(payload.customer_name) ? payload.customer_name.trim() : "";
  const customerPhone = isNonEmptyString(payload.customer_phone) ? payload.customer_phone.trim() : "";
  const serviceId = parsePositiveInteger(payload.service_id);
  const questionDetails =
    payload.question_details === undefined || payload.question_details === null || payload.question_details === ""
      ? null
      : typeof payload.question_details === "string"
        ? payload.question_details.trim()
        : undefined;

  if (!isNonEmptyString(customerName)) {
    errors.push("customer_name is required");
  }

  if (!isValidPhoneNumber(customerPhone)) {
    errors.push("customer_phone must be a valid phone number");
  }

  if (!Number.isInteger(serviceId)) {
    errors.push("service_id must be a positive integer");
  }

  if (payload.question_details !== undefined && questionDetails === undefined) {
    errors.push("question_details must be a string");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      customer_name: customerName,
      customer_phone: customerPhone,
      service_id: serviceId,
      question_details: questionDetails,
    },
  };
};
