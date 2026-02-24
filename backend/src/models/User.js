import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, default: "" },
  location: { type: String, default: "" },
  role: {
    type: String,
    enum: ["staff", "hr_admin", "super_admin", "hr"],
    default: "staff",
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
