import { registerRoute } from "./routeTracker.js";

export const track = (method, path, handler) => {
  registerRoute(method.toUpperCase(), path);
  return handler;
};