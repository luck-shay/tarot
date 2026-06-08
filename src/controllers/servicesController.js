import { getAllServices } from "../services/serviceCatalogService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listServices = asyncHandler(async (_req, res) => {
  const services = await getAllServices();

  res.status(200).json({
    success: true,
    data: services,
  });
});
