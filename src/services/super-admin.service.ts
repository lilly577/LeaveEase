import { api } from "./api";

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: "staff" | "hr_admin" | "super_admin" | "hr";
  department: string;
  location: string;
  isActive: boolean;
  createdAt: string;
};

export const listUsers = () => api.get("/super-admin/users");

export const createUserByAdmin = (data: {
  fullName: string;
  email: string;
  password: string;
  role: "staff" | "hr_admin" | "super_admin" | "hr";
  department?: string;
  location?: string;
}) => api.post("/super-admin/users", data);

export const updateUserRoleByAdmin = (id: string, role: AdminUser["role"]) =>
  api.put(`/super-admin/users/${id}/role`, { role });

export const updateUserStatusByAdmin = (id: string, isActive: boolean) =>
  api.put(`/super-admin/users/${id}/status`, { isActive });

export const resetUserPasswordByAdmin = (id: string, newPassword: string) =>
  api.put(`/super-admin/users/${id}/password`, { newPassword });

export const deleteUserByAdmin = (id: string) =>
  api.delete(`/super-admin/users/${id}`);

export const getPolicies = () => api.get("/super-admin/policies");
export const updatePolicies = (data: {
  leaveSlaHours?: number;
  maxAttachments?: number;
  maxAttachmentSizeMb?: number;
}) => api.put("/super-admin/policies", data);

export const getEmergencyControls = () => api.get("/super-admin/emergency");
export const updateEmergencyControls = (data: {
  maintenanceMode?: boolean;
  submissionsEnabled?: boolean;
}) => api.put("/super-admin/emergency", data);
