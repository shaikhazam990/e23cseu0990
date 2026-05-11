const Notification = require("../models/notification.model");

const findAll = async ({ filter = {}, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  return { notifications, total };
};

const findById = async (id) => {
  return Notification.findById(id);
};

const markAsRead = async (id) => {
  return Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );
};

const countUnread = async () => {
  return Notification.countDocuments({ isRead: false });
};

const findForPriority = async () => {
  return Notification.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

module.exports = { findAll, findById, markAsRead, countUnread, findForPriority };
