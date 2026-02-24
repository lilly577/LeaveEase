import express from "express";
import {
  sendFeedback,
  getFeedbacks,
  markFeedbackAsRead,
} from "../controllers/feedback.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { blockSubmissionsWhenDisabled } from "../middleware/system-control.middleware.js";

const router = express.Router();

router.post("/", protect, blockSubmissionsWhenDisabled, sendFeedback);
router.get("/", protect, authorizeRoles("hr", "hr_admin", "super_admin"), getFeedbacks);
router.put("/:id/read", protect, authorizeRoles("hr", "hr_admin", "super_admin"), markFeedbackAsRead);

export default router;
