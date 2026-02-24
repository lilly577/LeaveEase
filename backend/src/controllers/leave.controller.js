import Leave from "../models/LeaveRequest.js";
import { sendMail } from "../config/mail.js";
import { getSystemSettings } from "../services/systemSettings.service.js";

const normalizeRole = (role) => (role === "hr" ? "hr_admin" : role);
const normalizeLeaveStatus = (status) => {
  if (status === "rejected") return "denied";
  if (["pending", "approved", "denied"].includes(status)) return status;
  return "pending";
};

const resolveStage = (leave) => {
  if (leave?.currentStage === "completed") return "completed";
  if (leave?.currentStage === "escalated") return "escalated";
  if (leave?.currentStage === "hr_pending") return "hr_pending";
  if (leave?.currentStage === "manager_pending") return "hr_pending";
  const status = normalizeLeaveStatus(leave?.status);
  return status === "pending" ? "hr_pending" : "completed";
};

const buildAttachments = (files) =>
  (files || []).map((file) => ({
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path.replace(/\\/g, "/"),
    mimeType: file.mimetype,
    size: file.size,
  }));

export const createLeave = async (req, res) => {
  try {
    const { reason, description, startDate, endDate, startTime, endTime } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const attachments = buildAttachments(req.files);
    const settings = await getSystemSettings();
    const maxAttachments = Number(settings.maxAttachments || 3);
    const maxAttachmentSizeMb = Number(settings.maxAttachmentSizeMb || 5);

    if (attachments.length > maxAttachments) {
      return res.status(400).json({ message: `Maximum ${maxAttachments} attachments allowed` });
    }

    const tooLarge = attachments.find((file) => file.size > maxAttachmentSizeMb * 1024 * 1024);
    if (tooLarge) {
      return res.status(400).json({ message: `Attachment '${tooLarge.originalName}' exceeds ${maxAttachmentSizeMb}MB` });
    }

    const leave = await Leave.create({
      staff: req.user.id,
      reason,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      attachments,
      status: "pending",
      currentStage: "hr_pending",
      managerApproval: {
        status: "approved",
        note: "Manager role removed; sent directly to HR.",
      },
      hrApproval: { status: "pending" },
      slaDueAt: new Date(Date.now() + Number(settings.leaveSlaHours || 24) * 60 * 60 * 1000),
    });

    const io = req.app.get("io");
    io.emit("leave-created", leave);

    res.status(201).json(leave);
  } catch {
    res.status(500).json({ message: "Failed to create leave request" });
  }
};

export const myLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ staff: req.user.id })
      .populate("reviewedBy", "fullName")
      .sort("-createdAt");
    res.json(leaves);
  } catch {
    res.status(500).json({ message: "Failed to fetch leave requests" });
  }
};

export const allLeaves = async (req, res) => {
  try {
    const actorRole = normalizeRole(req.user.role);

    if (!["hr_admin", "super_admin"].includes(actorRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const leaves = await Leave.find()
      .populate("staff", "fullName email department location")
      .populate("reviewedBy", "fullName")
      .populate("hrApproval.actedBy", "fullName")
      .sort("-createdAt");

    const mapped = leaves.map((leave) => {
      leave.currentStage = resolveStage(leave);
      return leave;
    });

    res.json(mapped);
  } catch {
    res.status(500).json({ message: "Failed to fetch all leave requests" });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    const normalizedStatus = normalizeLeaveStatus(status);
    const actorRole = normalizeRole(req.user.role);

    if (!["hr_admin", "super_admin"].includes(actorRole)) {
      return res.status(403).json({ message: "HR access only" });
    }

    const leave = await Leave.findById(req.params.id)
      .populate("staff", "fullName email department location");

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.currentStage = resolveStage(leave);

    if (!["approved", "denied"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!["hr_pending", "escalated"].includes(leave.currentStage)) {
      return res.status(400).json({ message: "Leave is already finalized" });
    }

    leave.hrApproval.status = normalizedStatus;
    leave.hrApproval.actedBy = req.user.id;
    leave.hrApproval.actedAt = new Date();
    leave.hrApproval.note = reviewNote || "";
    leave.currentStage = "completed";
    leave.status = normalizedStatus;
    leave.reviewNote = reviewNote || "";
    leave.reviewedAt = new Date();
    leave.reviewedBy = req.user.id;

    await leave.save();

    if (leave.staff?.email) {
      try {
        await sendMail(
          leave.staff.email,
          "Leave Request Update",
          `Hello ${leave.staff.fullName},\n\nYour leave request is now ${leave.status}.\n\nStage: ${leave.currentStage}\n\nLeaveEase`
        );
      } catch (mailError) {
        console.error("Leave status updated but failed to send email:", mailError?.message || mailError);
      }
    }

    const io = req.app.get("io");
    io.emit("leave-updated", {
      leaveId: leave._id,
      status: leave.status,
      staffId: leave.staff?._id,
      stage: leave.currentStage,
    });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: "Failed to update leave status", detail: error?.message });
  }
};
