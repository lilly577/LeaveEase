import express from "express";
import {
  createLeave,
  myLeaves,
  allLeaves,
  updateLeaveStatus
} from "../controllers/leave.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { leaveAttachmentUpload } from "../middleware/upload.middleware.js";
import { blockSubmissionsWhenDisabled } from "../middleware/system-control.middleware.js";

const router = express.Router();

router.post("/", protect, blockSubmissionsWhenDisabled, leaveAttachmentUpload.array("attachments", 10), createLeave);
router.get("/my", protect, myLeaves);
router.get("/all", protect, authorizeRoles("hr", "hr_admin", "super_admin"), allLeaves);
router.put("/:id", protect, authorizeRoles("hr", "hr_admin", "super_admin"), updateLeaveStatus);

export default router;
