import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    maintenanceMode: { type: Boolean, default: false },
    submissionsEnabled: { type: Boolean, default: true },
    leaveSlaHours: { type: Number, default: 24, min: 1, max: 168 },
    maxAttachments: { type: Number, default: 3, min: 1, max: 10 },
    maxAttachmentSizeMb: { type: Number, default: 5, min: 1, max: 25 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("SystemSettings", systemSettingsSchema);

