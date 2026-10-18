const Notification = require("./notification.model");

const catchAsync = require("../utilite/catchAsync.utilte");
const AppError = require("../utilite/appError.utilite");

exports.getMyNotifications = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .lean();

  const data = notifications.map((notification) => {
    const isRead = notification.readBy.some(
      (id) => id.toString() === userId.toString(),
    );

    return {
      ...notification,
      isRead,
    };
  });

  const unreadCount = data.filter(
    (notification) => !notification.isRead,
  ).length;

  res.status(200).json({
    status: "success",
    results: data.length,
    unreadCount,
    data: {
      notifications: data,
    },
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findByIdAndUpdate(
    id,
    {
      $addToSet: {
        readBy: userId,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  const isRead = notification.readBy.some(
    (id) => id.toString() === userId.toString(),
  );

  res.status(200).json({
    status: "success",
    message: "Notification marked as read",
    data: {
      notification: {
        ...notification.toObject(),
        isRead,
      },
    },
  });
});
