import Schedule from "../models/Schedule.js";
import { sendMail } from "../config/mail.js";

const getTomorrowRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const sendOffDayReminders = async () => {
  const { start, end } = getTomorrowRange();

  const schedules = await Schedule.find({
    offDate: { $gte: start, $lte: end },
    reminderSentAt: { $exists: false },
  }).populate("staff", "fullName email");

  for (const schedule of schedules) {
    if (!schedule?.staff?.email) {
      continue;
    }

    try {
      await sendMail(
        schedule.staff.email,
        "Off-Day Reminder - Tomorrow",
        `Hello ${schedule.staff.fullName},\n\nThis is a reminder that you have an off-day scheduled for tomorrow (${new Date(schedule.offDate).toDateString()}).\n\nLeaveEase`
      );

      schedule.reminderSentAt = new Date();
      await schedule.save();
    } catch (error) {
      console.error(`Failed to send reminder for schedule ${schedule._id}:`, error);
    }
  }
};
