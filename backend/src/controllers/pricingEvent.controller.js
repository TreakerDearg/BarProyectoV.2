import PricingEvent from "../models/PricingEvent.js";
import { ok } from "../utils/response.js";

export const getPricingEvents = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const events = await PricingEvent.find()
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    return ok(res, events);
  } catch (error) { next(error); }
};
