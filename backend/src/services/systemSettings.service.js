import SystemSettings from "../models/SystemSettings.js";

export const getSystemSettings = async () => {
  const existing = await SystemSettings.findOne({ key: "global" });
  if (existing) return existing;
  return SystemSettings.create({ key: "global" });
};

