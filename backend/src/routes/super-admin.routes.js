import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  listUsers,
  createUser,
  updateUserRole,
  setUserActive,
  resetUserPassword,
  deleteUser,
  getPolicies,
  updatePolicies,
  getEmergencyControls,
  updateEmergencyControls,
} from "../controllers/superAdmin.controller.js";

const router = express.Router();

router.use(protect, authorizeRoles("super_admin"));

router.get("/users", listUsers);
router.post("/users", createUser);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/status", setUserActive);
router.put("/users/:id/password", resetUserPassword);
router.delete("/users/:id", deleteUser);

router.get("/policies", getPolicies);
router.put("/policies", updatePolicies);

router.get("/emergency", getEmergencyControls);
router.put("/emergency", updateEmergencyControls);

export default router;
