import Schedule from "../models/Schedule.js";
import User from "../models/User.js";
import { sendMail } from "../config/mail.js";

const normalizeRole = (role) => (role === "hr" ? "hr_admin" : role);

export const createSchedule = async (req, res) => {
  try {
    const actorRole = normalizeRole(req.user.role);
    const staffUser = await User.findById(req.body.staff).select("email fullName location");
    if (!staffUser) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    if (
      actorRole === "hr_admin" &&
      req.user.location &&
      staffUser.location &&
      req.user.location !== staffUser.location
    ) {
      return res.status(403).json({ message: "Out of location scope" });
    }

    const schedule = await Schedule.create({
      staff: req.body.staff,
      offDate: req.body.offDate,
      note: req.body.note,
      type: req.body.type || "scheduled",
    });

    if (staffUser?.email) {
      await sendMail(
        staffUser.email,
        "Off Day Notification",
        `Your off day is scheduled on ${new Date(req.body.offDate).toDateString()}`
      );
    }

    const populated = await schedule.populate("staff", "fullName email department");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to create schedule" });
  }
};

export const mySchedule = async (req, res) => {
  try {
    const schedule = await Schedule.find({ staff: req.user.id }).sort("offDate");
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch schedule" });
  }
};

export const allSchedules = async (req, res) => {
  try {
    const actorRole = normalizeRole(req.user.role);
    const schedule = await Schedule.find()
      .populate("staff", "fullName email department location")
      .sort("offDate");

    const filtered = schedule.filter((item) => {
      if (actorRole === "super_admin") return true;
      if (actorRole === "hr_admin") {
        if (!req.user.location || !item.staff?.location) return true;
        return req.user.location === item.staff.location;
      }
      return false;
    });

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch schedules" });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const actorRole = normalizeRole(req.user.role);
    const existing = await Schedule.findById(req.params.id).populate("staff", "location");

    if (!existing) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    if (
      actorRole !== "super_admin" &&
      req.user.location &&
      existing.staff?.location &&
      req.user.location !== existing.staff.location
    ) {
      return res.status(403).json({ message: "Out of location scope" });
    }

    const removed = await Schedule.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.json({ message: "Schedule deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete schedule" });
  }
};
