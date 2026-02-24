import Feedback from "../models/Feedback.js";

const sanitizeFeedback = (feedback) => {
  const data = feedback.toObject ? feedback.toObject() : feedback;

  if (data.isAnonymous) {
    return {
      ...data,
      staff: {
        fullName: "Anonymous Member",
      },
    };
  }

  return data;
};

export const sendFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      staff: req.user.id,
      subject: req.body.subject || "Staff Feedback",
      message: req.body.message,
      isAnonymous: !!req.body.isAnonymous,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit feedback" });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("staff", "fullName email department")
      .sort("-createdAt");

    res.json(feedbacks.map(sanitizeFeedback));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
};

export const markFeedbackAsRead = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    ).populate("staff", "fullName email department");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(sanitizeFeedback(feedback));
  } catch (error) {
    res.status(500).json({ message: "Failed to update feedback" });
  }
};
