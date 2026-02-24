import express from "express";
import { getStaffUsers } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/staff", protect, authorizeRoles("hr", "hr_admin", "super_admin"), getStaffUsers);

export default router;
