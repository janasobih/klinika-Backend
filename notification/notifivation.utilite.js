const Notification = require("./notification.model");
const { emitToAll } = require("./socket.io.utilite");

const createNotification = async ({
  type,
  title,
  message,
  relatedId,
  relatedModel,
}) => {
  const notification = await Notification.create({
    type,
    title,
    message,
    relatedId,
    relatedModel,
  });

  emitToAll("notification:new", notification);

  return notification;
};

module.exports = createNotification;
