import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  offDate: Date,
  note: String,
  type: { type: String, enum: ["scheduled", "approved_leave"], default: "scheduled" },
  reminderSentAt: Date,
}, { timestamps: true });

export default mongoose.model("Schedule", scheduleSchema);
