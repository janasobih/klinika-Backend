const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctorAppointments,
  getPatientAppointments,
} = require("../controller/appointment.controller");

const { authenticate } = require("../middleware/auth.middleware");
// const { authorize } = require("../middleware/role.middleware");

const { checkPermission } = require("../middleware/permission.middleware");

router.post(
  "/",
  authenticate,
  checkPermission("appointments"),
  createAppointment,
);

router.get("/", authenticate, getAllAppointments);

router.get("/doctor/:doctorId", authenticate, getDoctorAppointments);

router.get("/patient/:patientId", authenticate, getPatientAppointments);

router.get("/:id", authenticate, getAppointment);

router.patch(
  "/:id",
  authenticate,
  checkPermission("appointments"),
  updateAppointment,
);

router.delete(
  "/:id",
  authenticate,
  checkPermission("appointments"),
  deleteAppointment,
);

module.exports = router;
