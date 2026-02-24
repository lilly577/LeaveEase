import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} from "../controllers/announcement.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("hr", "hr_admin", "super_admin"), createAnnouncement);
router.get("/", protect, getAnnouncements);
router.delete("/:id", protect, authorizeRoles("hr", "hr_admin", "super_admin"), deleteAnnouncement);

export default router;
