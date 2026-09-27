const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
} = require("../controller/setting.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const upload = require("../middleware/uploads.middleware");

router.get("/", authenticate, authorize("admin"), getSettings);

router.put(
  "/",
  authenticate,
  authorize("admin"),
  upload.single("logo"),
  updateSettings,
);

module.exports = router;
