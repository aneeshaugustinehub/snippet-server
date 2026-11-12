import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {    
    const notifications = await Notification.find({ to: req.user._id })
      .sort({ createdAt: -1 })
      .populate("from", "userId name profilePic");

    await Notification.updateMany(
      { to: req.user._id, read: false },
      { read: true },
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
  
};

export const deleteNotifications = async (req, res) => {
  await Notification.deleteMany({ to: req.user._id });
  res.json({ message: "Notifications deleted" });
};
export const markAllRead = async (req, res) => {
  await Notification.updateMany({ to: req.user._id, read: false }, { read: true });
  res.json({ message: "ok" });
};

export const markRead = async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, to: req.user._id }, { read: true });
  res.json({ message: "ok" });
};

// router.patch("/read-all", protectRoute, markAllRead);
// router.patch("/:id/read", protectRoute, markRead);