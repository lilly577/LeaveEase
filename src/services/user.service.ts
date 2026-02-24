import { api } from "./api";

export const getStaffUsers = () =>
  api.get("/users/staff");
