const express = require("express");
const router = express.Router();

const {
  createUser,
  getAllUsers,
  updateUser,
  getMe,
  updateMe,
} = require("../controller/user.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

// const { checkPermission } = require("../middleware/permission.middleware");

const upload = require("../middleware/uploads.middleware");

router.post(
  "/",
  upload.single("img"),
  authenticate,
  authorize("admin"),
  createUser,
);

router.get("/", authenticate, authorize("admin"), getAllUsers);

router.get("/me", authenticate, getMe);

router.patch("/me", upload.single("img"), authenticate, updateMe);

router.patch(
  "/:slug",
  upload.single("img"),
  authenticate,
  authorize("admin"),
  updateUser,
);

module.exports = router;
