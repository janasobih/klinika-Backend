const express = require("express");
const router = express.Router();

const { getMyNotifications, markAsRead } = require("./notification.controller");

const { authenticate } = require("../middleware/auth.middleware");

router.get("/", authenticate, getMyNotifications);
router.patch("/:id/read", authenticate, markAsRead);

module.exports = router;
