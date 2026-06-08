import { createBookingWithPaymentLink } from "../services/bookingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBooking = asyncHandler(async (req, res) => {
  const bookingResult = await createBookingWithPaymentLink(req.validatedBody);

  res.status(201).json({
    success: true,
    bookingId: bookingResult.bookingId,
    paymentLink: bookingResult.paymentLink,
  });
});
