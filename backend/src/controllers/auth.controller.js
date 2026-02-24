import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  department: user.department || "",
  location: user.location || "",
  isActive: user.isActive !== false,
});

export const register = async (req, res) => {
  const { fullName, email, password, role, department, location } = req.body;
  const allowedRoles = new Set(["staff", "hr_admin", "super_admin", "hr"]);
  if (!allowedRoles.has(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    email,
    password: hashed,
    role,
    department,
    location,
    isActive: true,
  });

  res.status(201).json({
    message: "Account created",
    user: sanitizeUser(user),
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  if (user.isActive === false) return res.status(403).json({ message: "Account is deactivated" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, role: user.role, user: sanitizeUser(user) });
};
