const express = require("express");
const router = express.Router();

const {
  createInvoice,
  getAllInvoices,
  getInvoice,
  getPatientInvoices,
  updateInvoice,
  getDoctorInvoices,
} = require("../controller/invoice.controller");

const { authenticate } = require("../middleware/auth.middleware");
// const { authorize } = require("../middleware/role.middleware");

const { checkPermission } = require("../middleware/permission.middleware");

router.get("/", authenticate, getAllInvoices);

router.post("/", authenticate, checkPermission("invoice"), createInvoice);

router.get("/patient/:patientId", authenticate, getPatientInvoices);

router.get("/doctor/:doctorId", authenticate, getDoctorInvoices);

router.get("/:id", authenticate, getInvoice);

router.patch("/:id", authenticate, checkPermission("invoice"), updateInvoice);

module.exports = router;
