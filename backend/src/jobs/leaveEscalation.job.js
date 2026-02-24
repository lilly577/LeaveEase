import Leave from "../models/LeaveRequest.js";
import User from "../models/User.js";
import { sendMail } from "../config/mail.js";

const normalizeRole = (role) => (role === "hr" ? "hr_admin" : role);

export const processLeaveEscalations = async () => {
  const now = new Date();

  const overdueLeaves = await Leave.find({
    status: "pending",
    currentStage: { $in: ["hr_pending"] },
    slaDueAt: { $lt: now },
    escalatedAt: { $exists: false },
  }).populate("staff", "fullName email location department");

  for (const leave of overdueLeaves) {
    if (leave.currentStage === "hr_pending") {
      leave.currentStage = "escalated";
      leave.escalatedAt = now;
      leave.escalationReason = "HR SLA exceeded. Escalated for urgent attention.";
      leave.slaDueAt = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    }

    await leave.save();

    const hrUsers = await User.find().select("email role location");
    const recipients = hrUsers
      .filter((user) => {
        const role = normalizeRole(user.role);
        if (!["hr_admin", "super_admin"].includes(role)) return false;
        if (role === "super_admin") return true;
        if (!user.location || !leave.staff?.location) return true;
        return user.location === leave.staff.location;
      })
      .map((user) => user.email)
      .filter(Boolean);

    if (recipients.length > 0) {
      await sendMail(
        recipients.join(","),
        "Leave Request Escalation Alert",
        `Leave request from ${leave.staff?.fullName || "Staff"} has been escalated.\n\nReason: ${leave.escalationReason}\nCurrent Stage: ${leave.currentStage}`
      );
    }
  }
};
