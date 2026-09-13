const express = require("express");
const router = express.Router();

const {
  createUser,
  getAllUsers,
  getAccount,
  getAllDoctors,
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
  upload.fields([
    { name: "img", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
    { name: "awards", maxCount: 10 },
  ]),
  authenticate,
  authorize("admin"),
  createUser,
);

router.get("/", authenticate, authorize("admin"), getAllUsers);

router.get("/doctors", authenticate, authorize("admin"), getAllDoctors);

router.get("/:id", authenticate, authorize("admin"), getAccount);

router.get("/me", authenticate, getMe);

router.patch(
  "/me",
  upload.fields([
    { name: "img", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
    { name: "awards", maxCount: 10 },
  ]),
  authenticate,
  updateMe,
);

router.patch(
  "/:slug",
  upload.fields([
    { name: "img", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
    { name: "awards", maxCount: 10 },
  ]),
  authenticate,
  authorize("admin"),
  updateUser,
);

module.exports = router;
