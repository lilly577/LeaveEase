import { api } from "./api";

export const createLeave = (data: FormData | Record<string, unknown>) =>
  api.post("/leave", data);

export const getMyLeaves = () =>
  api.get("/leave/my");

export const getAllLeaves = () =>
  api.get("/leave/all");

export const updateLeaveStatus = (
  id: string,
  status: string,
  reviewNote?: string
) =>
  api.put(`/leave/${id}`, {
    status,
    reviewNote,
  });
