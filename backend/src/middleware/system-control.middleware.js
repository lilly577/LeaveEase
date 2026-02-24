import jwt from "jsonwebtoken";
import { getSystemSettings } from "../services/systemSettings.service.js";

export const checkMaintenanceMode = async (req, res, next) => {
  try {
    const settings = await getSystemSettings();
    if (!settings.maintenanceMode) return next();

    if (req.path.startsWith("/api/auth/login")) return next();

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(503).json({ message: "System is in maintenance mode" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.role === "super_admin") return next();

    return res.status(503).json({ message: "System is in maintenance mode" });
  } catch {
    return next();
  }
};

export const blockSubmissionsWhenDisabled = async (req, res, next) => {
  try {
    const settings = await getSystemSettings();
    if (settings.submissionsEnabled) return next();
    return res.status(503).json({ message: "Submissions are currently disabled by system administrator" });
  } catch {
    return next();
  }
};

