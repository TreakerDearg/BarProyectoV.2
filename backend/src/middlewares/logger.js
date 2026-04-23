import { logger } from "../config/logger.js";
import crypto from "crypto";

export const httpLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  const requestId =
    req.headers["x-request-id"] ||
    crypto.randomUUID();

  req.requestId = requestId;

  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e6; // ms

    const log = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    const message = `${log.method} ${log.url} ${log.status} ${log.duration} - ${log.ip}`;

    if (res.statusCode >= 500) {
      logger.error(message, log);
    } else if (res.statusCode >= 400) {
      logger.warn(message, log);
    } else {
      logger.info(message, log);
    }
  });

  next();
};