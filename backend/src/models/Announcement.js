import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: String,
  message: String,
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  expiresAt: Date,
  location: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Announcement", announcementSchema);
