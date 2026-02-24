import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import cron from "node-cron";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import userRoutes from "./routes/user.routes.js";
import superAdminRoutes from "./routes/super-admin.routes.js";
import { checkMaintenanceMode } from "./middleware/system-control.middleware.js";
import { sendOffDayReminders } from "./jobs/offDayReminder.job.js";
import { processLeaveEscalations } from "./jobs/leaveEscalation.job.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(checkMaintenanceMode);
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/super-admin", superAdminRoutes);

app.get("/", (_, res) => {
  res.send("LeaveEase API running");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.set("io", io);

cron.schedule("0 8 * * *", async () => {
  try {
    await sendOffDayReminders();
  } catch (error) {
    console.error("Off-day reminder job failed:", error);
  }
});

cron.schedule("0 * * * *", async () => {
  try {
    await processLeaveEscalations();
  } catch (error) {
    console.error("Leave escalation job failed:", error);
  }
});

setTimeout(() => {
  sendOffDayReminders().catch((error) => {
    console.error("Initial off-day reminder run failed:", error);
  });
  processLeaveEscalations().catch((error) => {
    console.error("Initial leave escalation run failed:", error);
  });
}, 10000);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
