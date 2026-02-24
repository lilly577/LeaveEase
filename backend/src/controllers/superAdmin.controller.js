import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { getSystemSettings } from "../services/systemSettings.service.js";

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  department: user.department || "",
  location: user.location || "",
  isActive: user.isActive !== false,
  createdAt: user.createdAt,
});

export const listUsers = async (_req, res) => {
  try {
    const users = await User.find()
      .select("fullName email role department location isActive createdAt")
      .sort("-createdAt");
    res.json(users.map(sanitizeUser));
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, department, location } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "fullName, email, password, role are required" });
    }

    const allowedRoles = new Set(["staff", "hr_admin", "super_admin", "hr"]);
    if (!allowedRoles.has(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashed,
      role,
      department: department || "",
      location: location || "",
      isActive: true,
    });

    res.status(201).json(sanitizeUser(user));
  } catch {
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = new Set(["staff", "hr_admin", "super_admin", "hr"]);
    if (!allowedRoles.has(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
      "fullName email role department location isActive createdAt",
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitizeUser(user));
  } catch {
    res.status(500).json({ message: "Failed to update role" });
  }
};

export const setUserActive = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be boolean" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select(
      "fullName email role department location isActive createdAt",
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(sanitizeUser(user));
  } catch {
    res.status(500).json({ message: "Failed to update user status" });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: "newPassword must be at least 6 characters" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { password: hashed }, { new: true }).select(
      "fullName email role department location isActive createdAt",
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Password reset successful", user: sanitizeUser(user) });
  } catch {
    res.status(500).json({ message: "Failed to reset password" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user?.id === userId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const target = await User.findById(userId).select("role");
    if (!target) return res.status(404).json({ message: "User not found" });

    if (target.role === "super_admin") {
      const superAdminCount = await User.countDocuments({ role: "super_admin" });
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: "Cannot delete the last super admin account" });
      }
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const getPolicies = async (_req, res) => {
  try {
    const settings = await getSystemSettings();
    res.json(settings);
  } catch {
    res.status(500).json({ message: "Failed to fetch system policies" });
  }
};

export const updatePolicies = async (req, res) => {
  try {
    const settings = await getSystemSettings();
    const { leaveSlaHours, maxAttachments, maxAttachmentSizeMb } = req.body;

    if (leaveSlaHours !== undefined) settings.leaveSlaHours = Number(leaveSlaHours);
    if (maxAttachments !== undefined) settings.maxAttachments = Number(maxAttachments);
    if (maxAttachmentSizeMb !== undefined) settings.maxAttachmentSizeMb = Number(maxAttachmentSizeMb);
    settings.updatedBy = req.user.id;

    await settings.save();
    res.json(settings);
  } catch {
    res.status(500).json({ message: "Failed to update system policies" });
  }
};

export const getEmergencyControls = async (_req, res) => {
  try {
    const settings = await getSystemSettings();
    res.json({
      maintenanceMode: settings.maintenanceMode,
      submissionsEnabled: settings.submissionsEnabled,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch emergency controls" });
  }
};

export const updateEmergencyControls = async (req, res) => {
  try {
    const settings = await getSystemSettings();
    const { maintenanceMode, submissionsEnabled } = req.body;

    if (maintenanceMode !== undefined) settings.maintenanceMode = !!maintenanceMode;
    if (submissionsEnabled !== undefined) settings.submissionsEnabled = !!submissionsEnabled;
    settings.updatedBy = req.user.id;

    await settings.save();
    res.json({
      maintenanceMode: settings.maintenanceMode,
      submissionsEnabled: settings.submissionsEnabled,
    });
  } catch {
    res.status(500).json({ message: "Failed to update emergency controls" });
  }
};
