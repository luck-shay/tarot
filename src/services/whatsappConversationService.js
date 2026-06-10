// services/whatsappConversationService.js

export const processIncomingMessage = async ({
  phone,
  text,
}) => {
  const session = await getSession(phone);

  if (!session) {
    await createSession(phone, "SHOW_SERVICES");

    return sendWhatsAppText(
      phone,
`🔮 Welcome to House of Arcana

1️⃣ One Question - ₹99
2️⃣ Three Questions - ₹249
3️⃣ Detailed Reading - ₹399
4️⃣ 15 Min Video Reading - ₹199
5️⃣ 30 Min Video Reading - ₹399
6️⃣ 45 Min Video Reading - ₹699

Reply with a number.`
    );
  }

  if (session.state === "SHOW_SERVICES") {
    const serviceId = Number(text);

    await updateSession(phone, {
      state: "ASK_QUESTION",
      selected_service_id: serviceId,
    });

    return sendWhatsAppText(
      phone,
      "Please tell me your question."
    );
  }

  if (session.state === "ASK_QUESTION") {
    const booking = await createBookingFromWhatsapp({
      phone,
      question: text,
      serviceId: session.selected_service_id,
    });

    const paymentLink =
      await generatePaymentLinkForBooking(booking);

    await updateSession(phone, {
      state: "WAIT_PAYMENT",
    });

    return sendWhatsAppText(
      phone,
      `Complete payment:\n${paymentLink}`
    );
  }
};

await updateSession(customerPhone, {
  state: "MANUAL_HANDOFF",
});