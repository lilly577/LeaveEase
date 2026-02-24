import User from "../models/User.js";

const normalizeRole = (role) => (role === "hr" ? "hr_admin" : role);

export const getStaffUsers = async (req, res) => {
  try {
    const role = normalizeRole(req.user.role);
    const users = await User.find({ role: "staff" })
      .select("fullName email department location role createdAt")
      .sort("fullName");

    const filtered = users.filter((user) => {
      if (role === "super_admin") return true;
      if (role === "hr_admin") {
        if (!req.user.location || !user.location) return true;
        return req.user.location === user.location;
      }
      return false;
    });

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch staff users" });
  }
};
