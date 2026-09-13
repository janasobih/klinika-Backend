const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
} = require("../controller/setting.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.get("/", authenticate, authorize("admin"), getSettings);

router.put("/", authenticate, authorize("admin"), updateSettings);

module.exports = router;
