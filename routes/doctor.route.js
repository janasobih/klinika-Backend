const express = require("express");
const router = express.Router();

const {
  createMyDoctorProfile,
  updateMyDoctorProfile,

  getAllDoctors,
  getDoctor,
  updateDoctor,
} = require("../controller/doctor.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const { checkPermission } = require("../middleware/permission.middleware");

router.post(
  "/me",
  authenticate,
  checkPermission("doctor.profile"),
  createMyDoctorProfile,
);

router.patch(
  "/me",
  authenticate,
  checkPermission("doctor.profile"),
  updateMyDoctorProfile,
);

router.get("/", authenticate, getAllDoctors);

router.get("/:slug", authenticate, getDoctor);

router.patch("/:slug", authenticate, authorize("admin"), updateDoctor);

module.exports = router;
