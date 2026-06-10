import { razorpay } from "../config/razorpay.js";

const PRICES = {
  1: 99,
  2: 249,
  3: 399,
  4: 199,
  5: 399,
  6: 699,
};

export const createPaymentLink = async (
  phone,
  serviceId
) => {
  const amount = PRICES[serviceId];

  const paymentLink =
    await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      accept_partial: false,
      description: `Tarot Reading ${serviceId}`,
      customer: {
        contact: phone,
      },
      notify: {
        sms: true,
        email: false,
      },
    });

  return paymentLink.short_url;
};