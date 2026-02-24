import { api } from "./api";

export const sendFeedback = (data: {
  subject: string;
  message: string;
  isAnonymous?: boolean;
}) =>
  api.post("/feedback", data);

export const getFeedbacks = () =>
  api.get("/feedback");

export const markFeedbackAsRead = (id: string) =>
  api.put(`/feedback/${id}/read`);
