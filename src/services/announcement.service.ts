import { api } from "./api";

export const getAnnouncements = () =>
  api.get("/announcements");

export const createAnnouncement = (data: {
  title: string;
  message?: string;
  content?: string;
  priority?: "low" | "medium" | "high";
  expiresAt?: string;
}) =>
  api.post("/announcements", data);

export const deleteAnnouncement = (id: string) =>
  api.delete(`/announcements/${id}`);
