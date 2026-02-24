import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = (req, res, next) => {
  (async () => {
    try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "_id role email department location fullName isActive"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      department: user.department || "",
      location: user.location || "",
      fullName: user.fullName,
    };
    next();
    } catch {
      res.status(401).json({ message: "Invalid token" });
    }
  })();
};
