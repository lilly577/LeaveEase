import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: String,
  description: String,
  startDate: Date,
  endDate: Date,
  startTime: String,
  endTime: String,
  attachments: [
    {
      originalName: String,
      fileName: String,
      filePath: String,
      mimeType: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "denied", "rejected"],
    default: "pending"
  },
  currentStage: {
    type: String,
    enum: ["manager_pending", "hr_pending", "completed", "escalated"],
    default: "hr_pending",
  },
  managerApproval: {
    status: {
      type: String,
      enum: ["pending", "approved", "denied", "delegated"],
      default: "pending",
    },
    actedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actedAt: Date,
    note: String,
    delegatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    delegationReason: String,
  },
  hrApproval: {
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
    },
    actedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actedAt: Date,
    note: String,
  },
  slaDueAt: Date,
  escalatedAt: Date,
  escalationReason: String,
  reviewNote: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date
}, { timestamps: true });

export default mongoose.model("LeaveRequest", leaveSchema);
