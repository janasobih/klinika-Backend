const express = require("express");
const router = express.Router();

const {
  getAppointmentsReport,
  getInvoiceReport,
  getPatientReport,
} = require("../controller/reports.controller");

const { authenticate } = require("../middleware/auth.middleware");
// const { authorize } = require("../middleware/role.middleware");

router.get("/appointments", authenticate, getAppointmentsReport);

router.get("/invoice", authenticate, getInvoiceReport);

router.get("/patient", authenticate, getPatientReport);

module.exports = router;
