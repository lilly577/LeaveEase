import Announcement from "../models/Announcement.js";

const normalizeRole = (role) => (role === "hr" ? "hr_admin" : role);

export const createAnnouncement = async (req, res) => {
  try {
    const actorRole = normalizeRole(req.user.role);
    const announcement = await Announcement.create({
      title: req.body.title,
      message: req.body.message || req.body.content,
      priority: req.body.priority || "medium",
      expiresAt: req.body.expiresAt || null,
      location: actorRole === "super_admin" ? (req.body.location || "") : (req.user.location || ""),
      createdBy: req.user.id,
    });

    const populated = await announcement.populate("createdBy", "fullName email");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to create announcement" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const actorRole = normalizeRole(req.user.role);
    const filter = actorRole === "super_admin"
      ? {}
      : {
          $or: [
            { location: "" },
            { location: req.user.location || "" },
          ],
        };

    const data = await Announcement.find(filter)
      .populate("createdBy", "fullName email")
      .sort("-createdAt");

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const actorRole = normalizeRole(req.user.role);
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (
      actorRole !== "super_admin" &&
      (announcement.location || "") !== (req.user.location || "")
    ) {
      return res.status(403).json({ message: "Out of location scope" });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};
