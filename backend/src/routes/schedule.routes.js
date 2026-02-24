import express from "express";
import {
  createSchedule,
  mySchedule,
  allSchedules,
  deleteSchedule,
} from "../controllers/schedule.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("hr", "hr_admin", "super_admin"), createSchedule);
router.get("/my", protect, mySchedule);
router.get("/all", protect, authorizeRoles("hr", "hr_admin", "super_admin"), allSchedules);
router.delete("/:id", protect, authorizeRoles("hr", "hr_admin", "super_admin"), deleteSchedule);

export default router;
