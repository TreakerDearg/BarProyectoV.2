import mongoose from "mongoose";

export const getDbStatus = () => {
  const state = mongoose.connection.readyState;

  return {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  }[state] || "unknown";
};