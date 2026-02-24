import { api } from "./api";

export const getMySchedule = () =>
  api.get("/schedule/my");

export const getAllSchedules = () =>
  api.get("/schedule/all");

export const createSchedule = (data: any) =>
  api.post("/schedule", data);

export const deleteSchedule = (id: string) =>
  api.delete(`/schedule/${id}`);
