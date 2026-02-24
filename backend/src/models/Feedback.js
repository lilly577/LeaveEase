import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: { type: String, default: "Staff Feedback" },
  message: String,
  isAnonymous: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Feedback", feedbackSchema);
