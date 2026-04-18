import { updateServiceStatus } from "../utils/routeTracker.js";

export const serviceTracker = (serviceName) => {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode >= 500) {
        updateServiceStatus(serviceName, "error");
      } else if (res.statusCode >= 400) {
        updateServiceStatus(serviceName, "warning");
      } else {
        updateServiceStatus(serviceName, "ok");
      }
    });

    next();
  };
};